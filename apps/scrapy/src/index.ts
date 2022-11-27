import { client, Teacher, Prisma, Term } from 'prismas';
import querystring from 'node:querystring';
import { parse, HTMLElement } from 'node-html-parser';
import { config } from 'dotenv';
import environment from 'environment';
import { capitalize } from 'shared';
import { v4 as uuidv4 } from 'uuid';
import { ClassWithSections, SectionWithTeachers, TeacherName } from 'types';
import { findOrCreateProfessor } from 'rmp';

config();

const url = 'https://reports.unc.edu/class-search/';
const advancedUrl = 'https://reports.unc.edu/class-search/advanced_search/';
const catalogUrl = 'https://catalog.unc.edu/courses/';

async function fetchClasses(url: string, term?: string, subject?: string) {
  const encodedParams = querystring.encode({ term, subject });
  console.log(`Fetching ${url}?${encodedParams}`);
  return (await fetch(`${url}?${encodedParams}`)).text();
}

async function fetchClassesAdvanced(url: string, term?: string, subjects?: string[]) {
  const encodedParams = querystring.encode({ term, advanced: subjects?.join(',') });
  console.log(`Fetching ${url}?${encodedParams}`);
  return (await fetch(`${url}?${encodedParams}`)).text();
}

function getCatalogSubjects(html: string) {
  const root = parse(html);
  return root
    .querySelectorAll('div#atozindex > ul > li > a')
    .map(a => a.text.match(/.*\((?<short>[A-Z]{4})\)/)?.groups?.short)
    .filter(a => !!a) as string[];
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

  let currentClass: Partial<ClassWithSections> = { sections: [] };
  const classes: ClassWithSections[] = [];

  // Since multiple teachers are handled with multiple rows each with a
  // different teacher, dedup by section number
  let currentSectionNumber = '';

  // Loop over the rows/sections in the table. Since the -13th column is the
  // class number, which is only specified for the first row/section.
  for (const row of table?.querySelectorAll('tr') ?? []) {
    const cols = Array.from(row.querySelectorAll('td')).map(col => col.text.trim());

    // If the class number is specified, then we are starting a new class. Only
    // push this if it has sections though to prevent pushing the initial value.
    if (cols.length >= 13 && (currentClass.sections?.length ?? 0 > 0)) {
      classes.push(currentClass as ClassWithSections);
      currentClass = { sections: [] };
    }

    currentClass.name = cols[cols.length - 9];

    const section: Partial<SectionWithTeachers> = {
      number: cols[cols.length - 11],
      room: cols[cols.length - 4],
      instruction: cols[cols.length - 3],
      teachers: [],
    };

    const teacher = parseTeacherName(cols[cols.length - 2]);
    // Since the section number is carried over between classes, make sure that
    // this isn't the first section in a class
    if (section.number === currentSectionNumber && (currentClass.sections?.length ?? 0) > 0) {
      if (!!teacher) {
        currentClass.sections?.[currentClass.sections.length - 1].teachers?.push(teacher);
      }
      continue;
    } else {
      if (!!teacher) {
        section.teachers!.push(teacher);
      }
      currentSectionNumber = section.number!;
    }

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

    currentClass.sections?.push(section as SectionWithTeachers);
  }

  // Since adding classes only happens on the start of a new class, the last
  // class will not be added. So we add it here
  if ((currentClass.sections?.length ?? 0) > 0) {
    classes.push(currentClass as ClassWithSections);
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

async function addClassesToDatabase(classes: ClassWithSections[], subjectSlug: string) {
  const { id: schoolId, rmpId } = await client.school.findFirstOrThrow({
    where: { name: 'The University of North Carolina at Chapel Hill' },
    select: { id: true, rmpId: true },
  });

  const subjectId = await getOrCreateSubject(schoolId, subjectSlug);

  // To prevent race conditions, make sure that professors won't have to be
  // created with the rest of the classes upserting.
  const uniqueTeachers = getUniqueTeachers(classes);
  await addTeachersToDatabase(schoolId, rmpId, uniqueTeachers);

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
        ...course,
        sections: {
          connectOrCreate: await Promise.all(
            course.sections?.map(async section => ({
              where: {
                classId_number_term_year: {
                  classId,
                  number: section.number,
                  term: section.term,
                  year: section.year,
                },
              },
              create: {
                ...section,
                teachers: {
                  connect: section.teachers.map(teacher => ({
                    schoolId_lastName_firstName: {
                      schoolId,
                      lastName: teacher.lastName,
                      firstName: teacher.firstName,
                    },
                  })),
                },
              },
            })),
          ),
        },
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
        ...course,
        sections: {
          connectOrCreate: await Promise.all(
            course.sections?.map(async section => ({
              where: {
                classId_number_term_year: {
                  classId,
                  number: section.number,
                  term: section.term,
                  year: section.year,
                },
              },
              create: {
                ...section,
                teachers: {
                  connect: section.teachers.map(teacher => ({
                    schoolId_lastName_firstName: {
                      schoolId,
                      lastName: teacher.lastName,
                      firstName: teacher.firstName,
                    },
                  })),
                },
              },
            })),
          ),
        },
      },
    });
  }
}

/**
 * Gets the list of unique teachers for the list of classes provided.
 * @param classes The list of classes to get the teachers from
 * @returns The list of unique teachers.
 */
function getUniqueTeachers(classes: ClassWithSections[]) {
  const teachers = new Set<string>();

  for (const course of classes) {
    for (const section of course.sections ?? []) {
      for (const teacher of section.teachers ?? []) {
        const key = JSON.stringify(teacher);
        teachers.add(key);
      }
    }
  }

  return Array.from(teachers).map(teacher => JSON.parse(teacher)) as TeacherName[];
}

/**
 * Adds the list of teachers to the database based on the schoolId provided.
 * @param schoolId The id of the school to add the teachers to.
 * @param rmpId The id of the school on RateMyProfessor.
 * @param teachers The list of teachers to add to the database. Must be unique.
 * @returns The list of teachers that were added to the database.
 */
async function addTeachersToDatabase(schoolId: string, rmpId: string, teachers: TeacherName[]) {
  const dbTeachers: (Teacher | undefined)[] = [];

  // Sleep a quarter second between each request to avoid rate limiting.
  for (const teacher of teachers) {
    console.log(`Fetching data for ${teacher.firstName} ${teacher.lastName}`);
    dbTeachers.push(await findOrCreateProfessor(schoolId, rmpId, teacher.firstName, teacher.lastName));
  }

  return dbTeachers.filter(teacher => !!teacher) as Teacher[];
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

function parseTeacherName(name: string) {
  if (name === 'None') {
    console.error('No teacher name');
    return undefined;
  }

  const [lastNames, firstNames] = name.split(',');
  const [lastName] = lastNames.split(' ');
  const [firstName] = firstNames.split(' ');

  console.log(`Parsing name for ${firstName} ${lastName}`);

  return { firstName: firstName.trim().toLowerCase(), lastName: lastName.trim().toLowerCase() } as TeacherName;
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
  // const subjectsOld = getSubjects(landing);

  // const webpage = await fetchClassesAdvanced(url, 'Spring 2023', subjects);
  // const table = getTable(webpage);
  // const classes = getClasses(table);
  // console.log(classes);
  // const subjects = ['SOCI'];

  const catalog = await (await fetch(catalogUrl)).text();
  const subjects = getCatalogSubjects(catalog);

  for (const subject of subjects) {
    const webpage = await fetchClasses(url, 'Spring 2023', subject);
    const table = getTable(webpage);
    const classes = getClasses(table);
    await addClassesToDatabase(classes, subject);

    console.log(JSON.stringify(classes, null, 2));
    console.log(await getSubjectName(subject));

    // delay unnecessary since the time between requests to UNC is pretty long
    // await new Promise(resolve => setTimeout(resolve, 1000));
  }
})();
