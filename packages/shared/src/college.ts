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
