export function validatePassword(password: string) {
  const validationRegex = /^.*(?=.{8,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*$/;
  return validationRegex.test(password);
}
