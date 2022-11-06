import { Class, Section, Subject } from 'prismas';

export type JoinedSubject = Subject & {
  classes: JoinedClass[];
};

export type JoinedClass = Class & {
  sections: Section[];
};
