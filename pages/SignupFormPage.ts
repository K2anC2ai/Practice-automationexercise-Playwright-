import { Page, Locator, expect } from '@playwright/test';
import { UserData } from '../data/user';

// Page Object สำหรับฟอร์ม signup เต็ม (/signup)
// step 2 หลังจากกรอกชื่อ + email ใน AuthPage แล้ว
export class SignupFormPage {
  readonly page: Page;

  readonly heading: Locator;           // "ENTER ACCOUNT INFORMATION"
  readonly titleMr: Locator;
  readonly passwordInput: Locator;
  readonly daysDropdown: Locator;
  readonly monthsDropdown: Locator;
  readonly yearsDropdown: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countryDropdown: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileInput: Locator;
  readonly createAccountBtn: Locator;

  // หน้ายืนยัน account
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading              = page.locator('b:has-text("ENTER ACCOUNT INFORMATION")');
    this.titleMr              = page.locator('#id_gender1');
    this.passwordInput        = page.locator('input[data-qa="password"]');
    this.daysDropdown         = page.locator('select[data-qa="days"]');
    this.monthsDropdown       = page.locator('select[data-qa="months"]');
    this.yearsDropdown        = page.locator('select[data-qa="years"]');
    this.newsletterCheckbox   = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');
    this.firstNameInput       = page.locator('input[data-qa="first_name"]');
    this.lastNameInput        = page.locator('input[data-qa="last_name"]');
    this.companyInput         = page.locator('input[data-qa="company"]');
    this.address1Input        = page.locator('input[data-qa="address"]');
    this.address2Input        = page.locator('input[data-qa="address2"]');
    this.countryDropdown      = page.locator('select[data-qa="country"]');
    this.stateInput           = page.locator('input[data-qa="state"]');
    this.cityInput            = page.locator('input[data-qa="city"]');
    this.zipcodeInput         = page.locator('input[data-qa="zipcode"]');
    this.mobileInput          = page.locator('input[data-qa="mobile_number"]');
    this.createAccountBtn     = page.locator('button[data-qa="create-account"]');

    this.accountCreatedHeading = page.locator('b:has-text("ACCOUNT CREATED!")');
    this.accountDeletedHeading = page.locator('b:has-text("ACCOUNT DELETED!")');
    this.continueBtn           = page.locator('a[data-qa="continue-button"]');
  }

  // กรอกฟอร์มทั้งหมดด้วย UserData และกด Create Account
  async fillAndCreate(user: UserData) {
    await expect(this.heading).toBeVisible();

    await this.titleMr.check();
    await this.passwordInput.fill(user.password);
    await this.daysDropdown.selectOption(user.birthDate);
    await this.monthsDropdown.selectOption(user.birthMonth);
    await this.yearsDropdown.selectOption(user.birthYear);
    await this.newsletterCheckbox.check();
    await this.specialOffersCheckbox.check();

    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.companyInput.fill(user.company);
    await this.address1Input.fill(user.address1);
    await this.address2Input.fill(user.address2);
    await this.countryDropdown.selectOption(user.country);
    await this.stateInput.fill(user.state);
    await this.cityInput.fill(user.city);
    await this.zipcodeInput.fill(user.zipcode);
    await this.mobileInput.fill(user.mobileNumber);

    await this.createAccountBtn.click();
  }

  async expectAccountCreated() {
    await expect(this.accountCreatedHeading).toBeVisible();
  }

  async expectAccountDeleted() {
    await expect(this.accountDeletedHeading).toBeVisible();
  }

  async clickContinue() {
    await this.continueBtn.click();
  }
}
