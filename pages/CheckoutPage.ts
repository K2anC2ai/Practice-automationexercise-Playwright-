import { Page, Locator, expect } from '@playwright/test';
import { UserData, PAYMENT } from '../data/user';

// Page Object ครอบ 3 ขั้นตอน:
// 1. /checkout     — address review + comment + place order
// 2. /payment      — payment form + confirm
// 3. /payment_done — success + download invoice
export class CheckoutPage {
  readonly page: Page;

  // checkout page
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly commentTextarea: Locator;
  readonly placeOrderBtn: Locator;

  // payment page
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payBtn: Locator;

  // success page
  readonly successMessage: Locator;
  readonly downloadInvoiceBtn: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.deliveryAddress  = page.locator('#address_delivery');
    this.billingAddress   = page.locator('#address_invoice');
    this.commentTextarea  = page.locator('textarea.form-control');
    this.placeOrderBtn    = page.locator('a:has-text("Place Order")');

    this.nameOnCardInput  = page.locator('input[data-qa="name-on-card"]');
    this.cardNumberInput  = page.locator('input[data-qa="card-number"]');
    this.cvcInput         = page.locator('input[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('input[data-qa="expiry-month"]');
    this.expiryYearInput  = page.locator('input[data-qa="expiry-year"]');
    this.payBtn           = page.locator('button[data-qa="pay-button"]');

    this.successMessage    = page.locator('p:has-text("Your order has been placed successfully!")');
    this.downloadInvoiceBtn = page.locator('a.btn:has-text("Download Invoice")');
    this.continueBtn       = page.locator('a[data-qa="continue-button"]');
  }

  async expectCheckoutPage() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.deliveryAddress).toBeVisible();
  }

  // ตรวจสอบว่า delivery address ตรงกับที่ลงทะเบียนไว้
  async expectDeliveryAddress(user: UserData) {
    await expect(this.deliveryAddress).toContainText(user.firstName);
    await expect(this.deliveryAddress).toContainText(user.lastName);
    await expect(this.deliveryAddress).toContainText(user.address1);
    await expect(this.deliveryAddress).toContainText(user.city);
  }

  async expectBillingAddress(user: UserData) {
    await expect(this.billingAddress).toContainText(user.firstName);
    await expect(this.billingAddress).toContainText(user.address1);
  }

  async fillCommentAndPlaceOrder(comment: string = 'Test order from Playwright automation') {
    await this.commentTextarea.fill(comment);
    await this.placeOrderBtn.click();
  }

  // กรอก payment info และ confirm
  async fillPaymentAndConfirm(payment = PAYMENT) {
    await expect(this.page).toHaveURL(/\/payment/);
    await this.nameOnCardInput.fill(payment.nameOnCard);
    await this.cardNumberInput.fill(payment.cardNumber);
    await this.cvcInput.fill(payment.cvc);
    await this.expiryMonthInput.fill(payment.expiryMonth);
    await this.expiryYearInput.fill(payment.expiryYear);
    await this.payBtn.click();
  }

  async expectOrderSuccess() {
    await expect(this.successMessage).toBeVisible();
  }

  // TC24: รอ download event แล้วตรวจสอบว่าไฟล์มีจริง
  async downloadInvoice() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadInvoiceBtn.click(),
    ]);
    const filePath = await download.path();
    expect(filePath, 'Invoice file should be downloaded').toBeTruthy();
    return download;
  }
}
