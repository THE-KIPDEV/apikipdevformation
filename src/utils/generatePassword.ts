export const generatePassword = (length: number) => {
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialCharacters = '~`¿¡!#$%^&*€£@+÷=-[]\\\';,/{}()|\\":<>?._';
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789é~`¿¡!#$%^&*€£@+÷=-[]\\\';,/{}()|\\":<>?._';
  let password = '';
  password += upperCaseLetters[Math.floor(Math.random() * upperCaseLetters.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
  for (let i = 0; i < length - 3; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};
