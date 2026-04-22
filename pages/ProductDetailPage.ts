import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้ารายละเอียดสินค้า (/product_details/:id)
export class ProductDetailPage {
  readonly page: Page;

  // ข้อมูลสินค้า
  readonly productName: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;

  // actions
  readonly quantityInput: Locator;
  readonly addToCartBtn: Locator;

  // review form
  readonly reviewHeading: Locator;     // "Write Your Review"
  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewTextarea: Locator;
  readonly submitReviewBtn: Locator;
  readonly reviewSuccess: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productName   = page.locator('.product-information h2');
    this.category      = page.locator('.product-information p:has-text("Category")');
    this.price         = page.locator('.product-information span span');
    this.availability  = page.locator('.product-information p:has-text("Availability")');
    this.condition     = page.locator('.product-information p:has-text("Condition")');
    this.brand         = page.locator('.product-information p:has-text("Brand")');

    this.quantityInput = page.locator('#quantity');
    this.addToCartBtn  = page.locator('button:has-text("Add to cart")');

    this.reviewHeading   = page.locator('a:has-text("Write Your Review")');
    this.reviewName      = page.locator('#name');
    this.reviewEmail     = page.locator('#email');
    this.reviewTextarea  = page.locator('#review');
    this.submitReviewBtn = page.locator('#button-review');
    this.reviewSuccess   = page.locator('.alert-success:has-text("Thank you for your review")');
  }

  // ตรวจสอบว่า product detail แสดงข้อมูลครบ 6 fields
  async expectProductDetailVisible() {
    await expect(this.productName).toBeVisible();
    await expect(this.category).toBeVisible();
    await expect(this.price).toBeVisible();
    await expect(this.availability).toBeVisible();
    await expect(this.condition).toBeVisible();
    await expect(this.brand).toBeVisible();
  }

  async setQuantity(qty: number) {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartBtn.click();
  }

  async submitReview(name: string, email: string, review: string) {
    await expect(this.reviewHeading).toBeVisible();
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewTextarea.fill(review);
    await this.submitReviewBtn.click();
  }

  async expectReviewSuccess() {
    await expect(this.reviewSuccess).toBeVisible();
  }
}
