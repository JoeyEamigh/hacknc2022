import { Term } from 'prismas';

export function stringToTermEnum(term: string): Term {
  switch (term) {
    case '2022 Fall':
      return Term.FALL2022;
    case '2023 Spring':
      return Term.SPRING2023;
    case '2023 Summer':
      return Term.SUMMER2023;
    case '2023 Fall':
      return Term.FALL2023;
    case '2024 Spring':
      return Term.SPRING2024;
    case '2024 Summer':
      return Term.SUMMER2024;
    case '2024 Fall':
      return Term.FALL2024;
    case '2025 Spring':
      return Term.SPRING2025;
    case '2025 Summer':
      return Term.SUMMER2025;
    case '2025 Fall':
      return Term.FALL2025;
    case '2026 Spring':
      return Term.SPRING2026;
  }
}

export function enumToTermString(term: Term): string {
  switch (term) {
    case Term.FALL2022:
      return '2022 Fall';
    case Term.SPRING2023:
      return '2023 Spring';
    case Term.SUMMER2023:
      return '2023 Summer';
    case Term.FALL2023:
      return '2023 Fall';
    case Term.SPRING2024:
      return '2024 Spring';
    case Term.SUMMER2024:
      return '2024 Summer';
    case Term.FALL2024:
      return '2024 Fall';
    case Term.SPRING2025:
      return '2025 Spring';
    case Term.SUMMER2025:
      return '2025 Summer';
    case Term.FALL2025:
      return '2025 Fall';
    case Term.SPRING2026:
      return '2026 Spring';
  }
}

export function getCurrentTerm() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month < 5) {
    return Term[`SPRING${year}`];
  } else if (month < 8) {
    return Term[`SUMMER${year}`];
  } else if (month < 12) {
    return Term[`FALL${year}`];
  }
}

export function truncateCollegeName(name: string): string {
  switch (name) {
    case 'The University of North Carolina at Chapel Hill':
      return 'UNC';
    case 'North Carolina State University':
      return 'NC State';
    case 'Duke University':
      return 'Duke';
  }
}
