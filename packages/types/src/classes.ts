import { Class, Section, Subject, Prisma } from 'prismas';

export type JoinedSubject = Subject & {
  classes: JoinedClass[];
};

export type JoinedClass = Class & {
  sections: Section[];
};

export type ClassWithSections = Omit<Prisma.ClassCreateInput, 'school' | 'subject' | 'aggregations'> & {
  sections: SectionWithTeachers[];
};

export type SectionWithTeachers = Omit<Prisma.SectionCreateWithoutClassInput, 'teachers'> & {
  teachers: TeacherName[];
};

export type TeacherName = { firstName: string; lastName: string };
