import { scraper } from 'scraper';
import { Class, client, Prisma, Section, Subject } from 'prismas';
import { ScrapedDataUNC } from './types';
import { v4 as uuid } from 'uuid';
import { stringToTermEnum } from 'shared';

(async () => {
  const data: ScrapedDataUNC = JSON.parse(await scraper());
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
          data: { slug: course.subject, school: { connect: { id: school.id } } },
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
          number: section.classNo,
          room: section.room,
          instruction: section.instruction_type,
          instructor: section.instructor,
          classNumber: section.classNo,
        });
      }

      console.log(classObj);
      console.log(sections);

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
})();
