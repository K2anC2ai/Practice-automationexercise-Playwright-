import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้าแรก (/) และ navbar ที่ปรากฏในทุกหน้า
export class HomePage {
  readonly page: Page;

  // navbar links
  readonly signupLoginBtn: Locator;
  readonly productsBtn: Locator;
  readonly cartBtn: Locator;
  readonly contactUsBtn: Locator;
  readonly testCasesBtn: Locator;
  readonly logoutBtn: Locator;
  readonly deleteAccountBtn: Locator;

  // แสดงหลัง login: "Logged in as <username>"
  readonly loggedInAs: Locator;

  // footer subscription section
  readonly subscriptionHeading: Locator;
  readonly subscriptionEmailInput: Locator; // id มีตัวสะกดผิดบน site จริง: "susbscribe"
  readonly subscribeBtn: Locator;
  readonly subscribeSuccess: Locator;

  // scroll & hero
  readonly scrollUpArrow: Locator;
  readonly heroText: Locator;

  // recommended items ที่ด้านล่างหน้าแรก
  readonly recommendedSection: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signupLoginBtn   = page.locator('a[href="/login"]');
    this.productsBtn      = page.locator('a[href="/products"]');
    this.cartBtn          = page.locator('a[href="/view_cart"]');
    this.contactUsBtn     = page.locator('a[href="/contact_us"]');
    this.testCasesBtn     = page.locator('a[href="/test_cases"]');
    this.logoutBtn        = page.locator('a[href="/logout"]');
    this.deleteAccountBtn = page.locator('a[href="/delete_account"]');

    this.loggedInAs = page.locator('li:has-text("Logged in as")');

    // ตัวสะกดผิดบน site จริง: "susbscribe_email"
    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscribeBtn           = page.locator('#subscribe');
    this.subscribeSuccess       = page.locator('#success-subscribe');
    this.subscriptionHeading    = page.locator('.single-widget h2');

    this.scrollUpArrow    = page.locator('#scrollUp');
    this.heroText         = page.locator('.item.active h2').first();
    this.recommendedSection = page.locator('#recommended-item-carousel');
  }

  async goto() {
    await this.page.goto('/');
  }

  // ตรวจสอบว่า home page โหลดสำเร็จ (มี logo และ nav ครบ)
  async expectHomePageVisible() {
    await expect(this.page).toHaveURL(/automationexercise\.com\/?$/);
    await expect(this.signupLoginBtn).toBeVisible();
  }

  async expectLoggedInAs(username: string) {
    await expect(this.loggedInAs).toContainText(username);
  }

  // scroll ลงไปถึง footer subscription section
  async scrollToFooter() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async subscribe(email: string) {
    await this.scrollToFooter();
    await this.subscriptionEmailInput.fill(email);
    await this.subscribeBtn.click();
  }

  async expectSubscribeSuccess() {
    await expect(this.subscribeSuccess).toBeVisible();
    await expect(this.subscribeSuccess).toContainText('You have been successfully subscribed!');
  }

  // กด arrow scroll-up แล้วตรวจสอบว่า hero text กลับมาใน viewport
  async scrollUpViaArrow() {
    await this.scrollUpArrow.click();
  }

  async expectHeroTextVisible() {
    await expect(this.page.locator('text=Full-Fledged practice website for Automation Engineers')).toBeInViewport();
  }
}
