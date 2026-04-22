import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้าตะกร้าสินค้า (/view_cart)
export class CartPage {
  readonly page: Page;

  readonly cartTable: Locator;
  readonly cartItems: Locator;

  // subscription footer (TC11)
  readonly subscriptionEmailInput: Locator;
  readonly subscribeBtn: Locator;
  readonly subscribeSuccess: Locator;

  // actions
  readonly proceedToCheckoutBtn: Locator;

  // modal ที่ขึ้นเมื่อ checkout โดยยังไม่ login
  readonly registerLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cartTable    = page.locator('#cart_info_table');
    this.cartItems    = page.locator('#cart_info_table tbody tr');

    this.subscriptionEmailInput = page.locator('#susbscribe_email');
    this.subscribeBtn           = page.locator('#subscribe');
    this.subscribeSuccess       = page.locator('#success-subscribe');

    this.proceedToCheckoutBtn = page.locator('.col-sm-6 a.btn.btn-default:has-text("Proceed To Checkout")');
    // ปุ่ม "Register / Login" ใน modal ที่ขึ้นเมื่อกด checkout โดยไม่ login
    this.registerLoginLink    = page.locator('.modal-body a:has-text("Register / Login")');
  }

  async goto() {
    await this.page.goto('/view_cart');
  }

  async expectCartPage() {
    await expect(this.page).toHaveURL(/\/view_cart/);
  }

  async expectItemCount(count: number) {
    if (count === 0) {
      await expect(this.cartItems).toHaveCount(0);
    } else {
      await expect(this.cartItems).toHaveCount(count);
    }
  }

  async expectItemInCart(name: string) {
    await expect(this.cartItems.filter({ hasText: name })).toBeVisible();
  }

  async getItemQuantity(name: string): Promise<string> {
    const item = this.cartItems.filter({ hasText: name });
    return (await item.locator('.cart_quantity button').textContent()) ?? '';
  }

  // ลบสินค้าออกจาก cart โดยกด X button
  async removeItem(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator('a.cart_quantity_delete').click();
  }

  async expectItemNotInCart(name: string) {
    await expect(this.cartItems.filter({ hasText: name })).toHaveCount(0);
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutBtn.click();
  }

  // สำหรับกรณีที่ยังไม่ login: กด Proceed → modal ขึ้น → กด Register/Login
  async clickRegisterLoginFromModal() {
    await this.registerLoginLink.click();
  }

  async scrollToFooter() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async subscribeNewsletter(email: string) {
    await this.scrollToFooter();
    await this.subscriptionEmailInput.fill(email);
    await this.subscribeBtn.click();
  }

  async expectSubscribeSuccess() {
    await expect(this.subscribeSuccess).toBeVisible();
  }
}
