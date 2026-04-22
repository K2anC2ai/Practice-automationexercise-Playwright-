import path from 'path';
import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { SignupFormPage } from '../pages/SignupFormPage';

// TC1-5: Authentication flows
// TC1, TC5 ใช้ userData (ยังไม่มี account) เพราะเทส signup flow เอง
// TC2, TC4 ใช้ apiCreatedUser (สร้างผ่าน API) เพราะเทส login/logout ไม่ใช่ signup
test.describe('Authentication', () => {
  let homePage: HomePage;
  let authPage: AuthPage;
  let signupFormPage: SignupFormPage;

  test.beforeEach(async ({ page }) => {
    homePage      = new HomePage(page);
    authPage      = new AuthPage(page);
    signupFormPage = new SignupFormPage(page);
  });

  // TC1: Register User — full UI signup flow
  // ไม่ใช้ apiCreatedUser เพราะนี่คือ test ของ signup ตั้งแต่ต้นจนจบ
  test('TC1: Register User with full signup flow', async ({ page, userData }) => {
    await test.step('Verify home page', async () => {
      await homePage.goto();
      await homePage.expectHomePageVisible();
    });

    await test.step('Navigate to Signup/Login and verify form', async () => {
      await homePage.signupLoginBtn.click();
      await authPage.expectSignupHeadingVisible();
    });

    await test.step('Fill name and email, click Signup', async () => {
      await authPage.initiateSignup(userData.name, userData.email);
    });

    await test.step('Fill account information form', async () => {
      await expect(signupFormPage.heading).toBeVisible();
      await signupFormPage.fillAndCreate(userData);
    });

    await test.step('Verify account created and continue', async () => {
      await signupFormPage.expectAccountCreated();
      await signupFormPage.clickContinue();
    });

    await test.step('Verify logged in as username', async () => {
      await homePage.expectLoggedInAs(userData.name);
    });

    await test.step('Delete account and verify deleted', async () => {
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });

  // TC2: Login with correct credentials — ใช้ apiCreatedUser เพราะไม่ต้องเทส signup
  test('TC2: Login User with correct email and password', async ({ page, apiCreatedUser }) => {
    await homePage.goto();
    await homePage.expectHomePageVisible();
    await homePage.signupLoginBtn.click();
    await authPage.expectLoginHeadingVisible();

    await authPage.login(apiCreatedUser.email, apiCreatedUser.password);
    await homePage.expectLoggedInAs(apiCreatedUser.name);

    // cleanup: ลบ account ผ่าน UI (apiCreatedUser fixture จะลบผ่าน API หลัง test จบด้วย)
    await homePage.deleteAccountBtn.click();
    await signupFormPage.expectAccountDeleted();
  });

  // TC3: Login with incorrect credentials — ไม่ต้องมี account จริง
  test('TC3: Login User with incorrect email and password', async ({ page }) => {
    await homePage.goto();
    await homePage.signupLoginBtn.click();
    await authPage.expectLoginHeadingVisible();

    await authPage.login('wrong@email.com', 'wrongpassword');
    await authPage.expectLoginError();
  });

  // TC4: Logout — ใช้ apiCreatedUser
  test('TC4: Logout User', async ({ page, apiCreatedUser }) => {
    await homePage.goto();
    await homePage.signupLoginBtn.click();
    await authPage.login(apiCreatedUser.email, apiCreatedUser.password);
    await homePage.expectLoggedInAs(apiCreatedUser.name);

    await homePage.logoutBtn.click();
    // หลัง logout ต้องกลับหน้า login
    await expect(page).toHaveURL(/\/login/);
    await authPage.expectLoginHeadingVisible();
  });

  // TC5: Register with existing email — ใช้ apiCreatedUser เป็น email ที่มีอยู่แล้ว
  test('TC5: Register User with existing email', async ({ page, apiCreatedUser }) => {
    await homePage.goto();
    await homePage.signupLoginBtn.click();
    await authPage.expectSignupHeadingVisible();

    // พยายาม signup ด้วย email ที่มีอยู่แล้วใน system
    await authPage.initiateSignup('Another Name', apiCreatedUser.email);
    await authPage.expectSignupEmailExistsError();
  });
});
