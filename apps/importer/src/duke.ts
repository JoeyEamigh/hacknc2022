import { scraper, getScraperLength } from 'scraper';
import { Class, client, Prisma, Section, Subject } from 'prismas';
import { ScrapedDataUNC, UNCCourse } from './types';
import { arrayOfNLength, capitalize, stringToTermEnum } from 'shared';
import { config } from 'dotenv';
import environment from 'environment';
import fs from 'fs/promises';
import { join } from 'path';

config({ path: '../../packages/prismas/.env' });

(async () => {
  scrape();
})();

async function scrape() {
  const data: any = JSON.parse(await fs.readFile(join(__dirname, '../assets/duke.json'), 'utf-8'));
  const school = await client.school.upsert({
    where: { id: 'U2Nob29sLTEzNTA=' },
    update: { name: 'Duke University' },
    create: { id: 'U2Nob29sLTEzNTA=', name: 'Duke University' },
  });
  const presentSubjects: Partial<Subject>[] = await client.subject.findMany({ where: { schoolId: school.id } });

  for (const courseI in data) {
    const course = data[courseI] as unknown as any;
    let subject = presentSubjects.find(s => s.slug === course.subject);
    if (!subject)
      (subject = await client.subject.create({
        data: {
          slug: course.subject,
          name: await getLongName(course.subject),
          school: { connect: { id: school.id } },
        },
      })) && presentSubjects.push(subject);
    if (!subject.name) {
      subject = await client.subject.update({
        where: { slug_schoolId: { slug: subject.slug, schoolId: school.id } },
        data: {
          name: await getLongName(course.subject),
          school: { connect: { id: school.id } },
        },
      });
    }
    const sections: Partial<Section>[] = [];
    const classObj: Partial<Class> = {
      name: course.desc,
      number: course.classNo,
      equivalencies: course.equivalences.filter(e => e !== ''),
      term: stringToTermEnum(course.term),
      hours: course.hours,
    };
    for (const sectionI in course.sections) {
      const section = course.sections[sectionI];
      console.log('sec', section);
      console.log('i', sectionI);
      console.log('sex', course.sections);
      sections.push({
        number: sectionI,
        room: section.room || 'None',
        instruction: section.instruction_type || 'Unknown',
        instructor: section.instructor || 'Unknown',
        classNumber: section.classNo,
      });
    }

    console.log(sections);

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

    console.log(classObj.term);

    if (!subject.id || !course.classNo || !classObj.term) continue;
    console.log('made it!');
    await client.class.upsert({
      where: {
        subjectId_number_term: { subjectId: subject.id, number: course.classNo, term: classObj.term },
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

async function getLongName(slug: string) {
  try {
    return capitalize((await (await fetch(`${environment.lookupUrl}/duke/${slug}`)).json()).long);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
