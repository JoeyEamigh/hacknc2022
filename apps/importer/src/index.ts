import { scraper, getScraperLength } from 'scraper';
import { Class, client, Prisma, Section, Subject } from 'prismas';
import { ScrapedDataUNC } from './types';
import { arrayOfNLength, capitalize, stringToTermEnum } from 'shared';
import { config } from 'dotenv';
import environment from 'environment';

config({ path: '../../packages/prismas/.env' });

const instances = 1;
const start = 0;
const iterate = 5;

(async () => {
  const possibilities = await getScraperLength();

  for (let i = start || 0; i < possibilities; i += instances * iterate) {
    const runners = arrayOfNLength(instances).map((_, it) => scrape(i + it * iterate, i + iterate + it * iterate));
    await Promise.all(runners);
  }
})();

async function scrape(start: number, end: number) {
  const data: ScrapedDataUNC = JSON.parse(
    await new Promise(async resolve => {
      try {
        await scraper(start, end).then(value => resolve(value));
      } catch (err) {
        await scraper(start, end).then(value => resolve(value));
      }
    }),
  );
  const school = await client.school.findFirst({
    where: { name: 'The University of North Carolina at Chapel Hill' },
  });
  const presentSubjects: Partial<Subject>[] = await client.subject.findMany({ where: { schoolId: school.id } });

  for (const termI in data) {
    const term = data[termI];
    for (const courseI in term) {
      const course = term[courseI];
      let subject = presentSubjects.find(s => s.slug === course.subject);
      if (!subject)
        (subject = await client.subject.create({
          data: {
            slug: course.subject,
            name: await getLongName(course.subject),
            school: { connect: { id: school.id } },
          },
        })) && presentSubjects.push(subject);
      const sections: Partial<Section>[] = [];
      const classObj: Partial<Class> = {
        name: course.desc,
        number: course.catNo,
        equivalencies: course.equivalences.filter(e => e !== ''),
        term: stringToTermEnum(course.term),
        hours: course.hours,
      };
      for (const sectionI in course.sections) {
        const section = course.sections[sectionI];
        sections.push({
          number: sectionI,
          room: section.room || 'None',
          instruction: section.instruction_type || 'Unknown',
          instructor: section.instructor || 'Unknown',
          classNumber: section.classNo,
        });
      }

      sections.forEach((section, i) => {
        const otherSections = sections.filter((_, j) => i !== j);
        const otherSection = otherSections.find(
          otherSection => otherSection.number === section.number && otherSection.classNumber === section.classNumber,
        );
        if (otherSection) {
          otherSection.instructor = `${otherSection.instructor}; ${section.instructor}`;
          sections.splice(i, 1);
        }
      });

      if (!subject.id || !course.catNo || !classObj.term) continue;
      await client.class.upsert({
        where: {
          subjectId_number_term: { subjectId: subject.id, number: course.catNo, term: classObj.term },
        },
        create: {
          ...(classObj as Prisma.ClassCreateInput),
          sections: {
            connectOrCreate: (sections as Section[]).map(s => ({
              create: s,
              where: { classNumber_number: { classNumber: s.classNumber, number: s.number } },
            })),
          },
          subject: { connect: { id: subject.id } },
        },
        update: {
          ...(classObj as Prisma.ClassCreateInput),
          sections: {
            connectOrCreate: (sections as Section[]).map(s => ({
              create: s,
              where: { classNumber_number: { classNumber: s.classNumber, number: s.number } },
            })),
          },
          subject: { connect: { id: subject.id } },
        },
      });
    }
  }
}

async function getLongName(slug: string) {
  try {
    return capitalize((await (await fetch(`${environment.lookupUrl}/unc/${slug}`)).json()).long);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
