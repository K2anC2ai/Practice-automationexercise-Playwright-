import { test as base, expect } from '@playwright/test';
import { generateUser, UserData } from '../data/user';

// custom fixtures ที่ extend จาก Playwright's base test
// apiCreatedUser: สร้าง user ผ่าน API ก่อน test รัน และลบหลัง test จบ
// วิธีนี้เร็วกว่า UI signup มากสำหรับ test ที่ไม่ได้ทดสอบ signup flow เอง
type CustomFixtures = {
  userData: UserData;
  apiCreatedUser: UserData;
};

export const test = base.extend<CustomFixtures>({
  // userData: แค่ generate data ให้ ไม่ได้สร้าง account จริง (สำหรับ TC1, TC14, TC15)
  userData: async ({}, use) => {
    await use(generateUser());
  },

  // apiCreatedUser: สร้าง account ผ่าน API ก่อน test → ใช้งาน → ลบทิ้งหลัง test
  // setup และ teardown อยู่ใน fixture เดียว ไม่ต้องมี beforeEach/afterEach แยก
  apiCreatedUser: async ({ request }, use) => {
    const user = generateUser();

    const createRes = await request.post('/api/createAccount', {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: user.title,
        birth_date: user.birthDate,
        birth_month: '6',
        birth_year: user.birthYear,
        firstname: user.firstName,
        lastname: user.lastName,
        company: user.company,
        address1: user.address1,
        address2: user.address2,
        country: user.country,
        state: user.state,
        city: user.city,
        zipcode: user.zipcode,
        mobile_number: user.mobileNumber,
      },
    });
    const createJson = await createRes.json();
    expect(createJson.responseCode, 'API user creation failed').toBe(201);

    // ส่ง user data ให้ test ใช้งาน
    await use(user);

    // teardown: ลบ user หลัง test จบเสมอ (แม้ test จะ fail)
    await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  },
});

export { expect } from '@playwright/test';
