import { Term } from 'prismas';

export function getCurrentTerm() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month <= 5) {
    return Term[`SPRING`];
  } else if (month <= 7) {
    return Term[`SUMMER`];
  } else if (month <= 12) {
    return Term[`FALL`];
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
