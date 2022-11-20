import { client, Class, Section, Prisma, Term } from 'prismas';
import querystring from 'node:querystring';
import { parse, HTMLElement } from 'node-html-parser';
import { JoinedClass } from 'types';
import { config } from 'dotenv';
import environment from 'environment';
import { capitalize } from 'shared';
import { v4 as uuidv4 } from 'uuid';

config();

const url = 'https://reports.unc.edu/class-search/';

async function fetchClasses(url: string, term?: string, subject?: string) {
  const encodedParams = querystring.encode({ term, subject });
  console.log(`Fetching ${url}?${encodedParams}`);
  return (await fetch(`${url}?${encodedParams}`)).text();
}

function getSubjects(html: string): string[] {
  const root = parse(html);
  return JSON.parse(root.querySelector('script#json_subjects')?.text ?? '[]');
}

function getTable(html: string) {
  const root = parse(html);
  return root.querySelector('table#results-table > tbody');
}

function getClasses(table: HTMLElement | null) {
  if (!table) {
    return [];
  }

  let currentClass: Partial<JoinedClass> = { sections: [] };
  const classes: typeof currentClass[] = [];

  // Loop over the rows/sections in the table. Since the -13th column is the
  // class number, which is only specified for the first row/section.
  for (const row of table?.querySelectorAll('tr') ?? []) {
    const cols = Array.from(row.querySelectorAll('td')).map(col => col.text.trim());

    // If the class number is specified, then we are starting a new class. Only
    // push this if it has sections though to prevent pushing the initial value.
    if (cols.length >= 13 && (currentClass.sections?.length ?? 0 > 0)) {
      classes.push(currentClass);
      currentClass = { sections: [] };
    }

    currentClass.name = cols[cols.length - 9];

    const section: Partial<Section> = {
      number: cols[cols.length - 11],
      room: cols[cols.length - 4],
      instruction: cols[cols.length - 3],
    };

    const { term, year } = parseTerm(cols[cols.length - 8]);
    [section.term, section.year] = [term, year];

    if (!section.term) {
      console.error(`Invalid term: ${cols[cols.length - 8]}`);
      continue;
    }

    currentClass.hours = new Prisma.Decimal(cols[cols.length - 7] || '0');

    const equivs = cols[cols.length - 12].split(', ');
    if (equivs.length > 0 && equivs[0] !== '') {
      currentClass.equivalencies = equivs;
    }

    if (cols.length >= 13) {
      currentClass.number = cols[cols.length - 13];
    }

    // should really still be a partial but treat it as a though it isn't
    // because it's easier
    currentClass.sections?.push(section as Section);
  }

  // Since adding classes only happens on the start of a new class, the last
  // class will not be added. So we add it here
  if (currentClass.sections?.length ?? 0 > 0) {
    classes.push(currentClass);
  }

  return classes;
}

function parseTerm(term: string): { term?: Term; year: number } {
  const [rawYear, rawTerm] = term.split(/\s+/);
  const year = parseInt(rawYear, 10);

  // TODO(tslnc04): Handle other terms, like Maymester
  if (rawTerm.toUpperCase() in Term) {
    return { term: rawTerm.toUpperCase() as Term, year };
  }

  return { year };
}

async function getSubjectName(slug: string) {
  try {
    const escapedSlug = querystring.escape(slug);
    const resp = await fetch(`${environment.lookupUrl}/unc/${escapedSlug}`);
    const json = await resp.json();
    return capitalize(json.long);
  } catch (err) {
    console.error(`Error fetching subject name for ${slug}`);
    return undefined;
  }
}

async function addClassesToDatabase(classes: Partial<JoinedClass>[], subjectSlug: string) {
  const schoolId = (
    await client.school.findFirstOrThrow({
      where: { name: 'The University of North Carolina at Chapel Hill' },
      select: { id: true },
    })
  ).id;

  const subjectId = await getOrCreateSubject(schoolId, subjectSlug);

  // Since the uniqueness of a section depends on the classId, try grabbing the
  // classId if the class exists and use that for updating the sections,
  // otherwise generate a uuid for the classId when creating the class
  for (const course of classes) {
    if (!course.number || !course.name || !course.hours) {
      continue;
    }

    const classId =
      (
        await client.class.findUnique({
          where: { schoolId_subjectId_number: { schoolId, subjectId, number: course.number } },
          select: { id: true },
        })
      )?.id ?? uuidv4();

    await client.class.upsert({
      where: { schoolId_subjectId_number: { schoolId, subjectId, number: course.number } },
      create: {
        ...(course as Prisma.Without<Partial<JoinedClass>, { classAggregationsId: string }>),
        sections: {
          connectOrCreate: course.sections?.map(section => ({
            where: {
              classId_number_term_year: {
                classId,
                number: section.number,
                term: section.term,
                year: section.year,
              },
            },
            create: section,
          })),
        },
        // TODO(tslnc04): Fix this. Figure out the types to ensure that we're
        // closer to Prisma.ClassCreateInput
        name: course.name!,
        number: course.number!,
        hours: course.hours!,
        subject: { connect: { id: subjectId } },
        school: { connect: { id: schoolId } },
        aggregations: {
          connectOrCreate: {
            where: { classId },
            create: createNewAggregation(),
          },
        },
        id: classId,
      },
      update: {
        ...(course as Prisma.Without<Partial<JoinedClass>, { classAggregationsId: string }>),
        sections: {
          connectOrCreate: course.sections?.map(section => ({
            create: section,
            where: {
              classId_number_term_year: {
                classId,
                number: section.number,
                term: section.term,
                year: section.year,
              },
            },
          })),
        },
        subject: { connect: { id: subjectId } },
        school: { connect: { id: schoolId } },
      },
    });
  }
}

// Returns the ID corresponding to the subject slug or creates a new subject and
// then returns the ID. This queries the lookup service to get the full name of
// the subject for the slug if available
async function getOrCreateSubject(schoolId: string, subjectSlug: string) {
  const subject = await client.subject.findUnique({
    where: { schoolId_slug: { schoolId, slug: subjectSlug } },
    select: { id: true },
  });

  if (!!subject) {
    return subject.id;
  }

  const name = await getSubjectName(subjectSlug);

  const newSubject = await client.subject.create({
    data: {
      name,
      slug: subjectSlug,
      school: { connect: { id: schoolId } },
    },
    select: { id: true },
  });

  return newSubject.id;
}

function createNewAggregation(): Prisma.ClassAggregationsCreateInput {
  return {
    numRatings: 0,
    cumRating: 0,
    difficulty: 0,
    wouldRecommend: 0,
    totalFive: 0,
    totalFour: 0,
    totalThree: 0,
    totalTwo: 0,
    totalOne: 0,
  };
}

(async () => {
  // const landing = await fetchClasses(url);
  // const subjects = getSubjects(landing);
  const subjects = ['MATH'];

  for (const subject of subjects) {
    const webpage = await fetchClasses(url, 'Spring 2023', subject);
    const table = getTable(webpage);
    const classes = getClasses(table);
    await addClassesToDatabase(classes, subject);

    console.log(JSON.stringify(classes, null, 2));
    console.log(await getSubjectName(subject));

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
})();
