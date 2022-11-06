export type ScrapedDataUNC = { [i: string]: UNCTerm };

export interface UNCTerm {
  [i: string]: UNCCourse;
}

export interface UNCCourse {
  desc: string;
  subject: string;
  catNo: string;
  equivalences: string[];
  term: string;
  hours: string;
  sections: { [i: string]: UNCSection };
}

export interface UNCSection {
  classNo: string;
  schedule: string;
  room: string;
  instruction_type: string;
  instructor: string;
}
