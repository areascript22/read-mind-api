export const isValidEspochEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@espoch\.edu\.ec$/;
  return regex.test(email);
};
