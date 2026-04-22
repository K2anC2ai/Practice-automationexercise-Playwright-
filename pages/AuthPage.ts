import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้า Login/Signup (/login)
// หน้านี้รวมสองฟอร์มไว้: Login (ซ้าย) และ New User Signup (ขวา)
export class AuthPage {
  readonly page: Page;

  // Login section
  readonly loginHeading: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginBtn: Locator;
  readonly loginError: Locator;

  // Signup section (step 1: แค่ชื่อ + email)
  readonly signupHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupBtn: Locator;
  readonly signupError: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginHeading      = page.locator('h2:has-text("Login to your account")');
    this.loginEmailInput   = page.locator('input[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('input[data-qa="login-password"]');
    this.loginBtn          = page.locator('button[data-qa="login-button"]');
    this.loginError        = page.locator('p:has-text("Your email or password is incorrect!")');

    this.signupHeading     = page.locator('h2:has-text("New User Signup!")');
    this.signupNameInput   = page.locator('input[data-qa="signup-name"]');
    this.signupEmailInput  = page.locator('input[data-qa="signup-email"]');
    this.signupBtn         = page.locator('button[data-qa="signup-button"]');
    this.signupError       = page.locator('p:has-text("Email Address already exist!")');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginBtn.click();
  }

  // กรอกชื่อ + email แล้วกด Signup (ยังไม่ใช่ form เต็ม — ต่อด้วย SignupFormPage)
  async initiateSignup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupBtn.click();
  }

  async expectLoginHeadingVisible() {
    await expect(this.loginHeading).toBeVisible();
  }

  async expectSignupHeadingVisible() {
    await expect(this.signupHeading).toBeVisible();
  }

  async expectLoginError() {
    await expect(this.loginError).toBeVisible();
  }

  async expectSignupEmailExistsError() {
    await expect(this.signupError).toBeVisible();
  }
}
