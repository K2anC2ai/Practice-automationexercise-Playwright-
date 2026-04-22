// data factory — ใช้ timestamp ทำให้ email ไม่ซ้ำกันทุก test run
export type UserData = {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDate: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
};

export function generateUser(): UserData {
  const ts = Date.now();
  return {
    name: 'Playwright Tester',
    email: `pw_tester_${ts}@mailtest.dev`,
    password: 'SecurePass@123',
    title: 'Mr',
    birthDate: '15',
    birthMonth: 'June',
    birthYear: '1990',
    firstName: 'Playwright',
    lastName: 'Tester',
    company: 'Test Corp',
    address1: '123 Automation Street',
    address2: 'Suite 100',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
    zipcode: '90001',
    mobileNumber: '0812345678',
  };
}

export const PAYMENT = {
  nameOnCard: 'Playwright Tester',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2027',
};
