import { Page, Locator, expect } from '@playwright/test';

// Page Object สำหรับหน้า All Products (/products) และ search/category/brand
export class ProductsPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly productCards: Locator;       // ทุก product card บนหน้า
  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly searchedHeading: Locator;    // "SEARCHED PRODUCTS"

  // sidebar
  readonly brandLinks: Locator;
  readonly womenCategoryBtn: Locator;
  readonly menCategoryBtn: Locator;

  // modal ที่ปรากฏหลัง add to cart
  readonly cartModal: Locator;
  readonly continueShoppingBtn: Locator;
  readonly viewCartBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading          = page.locator('.features_items .title.text-center').first();
    this.productCards     = page.locator('.product-image-wrapper');
    this.searchInput      = page.locator('#search_product');
    this.searchBtn        = page.locator('#submit_search');
    this.searchedHeading  = page.locator('h2.title.text-center:has-text("Searched Products")');

    this.brandLinks       = page.locator('.brands_products .brands-name ul li a');
    this.womenCategoryBtn = page.locator('#accordian a:has-text("Women")');
    this.menCategoryBtn   = page.locator('#accordian a:has-text("Men")');

    this.cartModal          = page.locator('#cartModal');
    this.continueShoppingBtn = page.locator('#cartModal button:has-text("Continue Shopping")');
    this.viewCartBtn         = page.locator('#cartModal a:has-text("View Cart")');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async expectAllProductsPage() {
    await expect(this.page).toHaveURL(/\/products/);
    await expect(this.heading).toContainText('All Products');
  }

  // hover เพื่อ reveal overlay แล้วกด "Add to cart"
  async hoverAndAddToCart(index: number) {
    const card = this.productCards.nth(index);
    await card.hover();
    await card.locator('.add-to-cart').click();
    // รอ modal ขึ้น
    await expect(this.cartModal).toBeVisible();
  }

  async dismissModalContinueShopping() {
    await this.continueShoppingBtn.click();
    await expect(this.cartModal).not.toBeVisible();
  }

  async dismissModalViewCart() {
    await this.viewCartBtn.click();
  }

  async clickViewProduct(index: number) {
    await this.productCards.nth(index).locator('a:has-text("View Product")').click();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchBtn.click();
    await expect(this.searchedHeading).toBeVisible();
  }

  async getSearchResultCount(): Promise<number> {
    return this.productCards.count();
  }

  // เพิ่มสินค้าที่ปรากฏใน search result ทุกชิ้นลง cart
  async addAllSearchResultsToCart() {
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      await this.hoverAndAddToCart(i);
      if (i < count - 1) {
        await this.dismissModalContinueShopping();
      }
    }
  }

  // คลิก brand แรกใน sidebar แล้ว return ชื่อ brand นั้น
  async clickBrand(index: number): Promise<string> {
    const brandLink = this.brandLinks.nth(index);
    const name = (await brandLink.textContent())?.trim() ?? '';
    await brandLink.click();
    return name;
  }

  async expectBrandPageFor(brandName: string) {
    await expect(this.heading).toContainText(brandName, { ignoreCase: true });
  }

  async clickWomenCategory() {
    await this.womenCategoryBtn.click();
  }

  async clickWomenSubcategory(name: string) {
    await this.page.locator(`#Women a:has-text("${name}")`).click();
  }

  async clickMenSubcategory(name: string) {
    await this.page.locator(`#Men a:has-text("${name}")`).click();
  }

  async expectCategoryPageContains(text: string) {
    await expect(this.heading).toContainText(text, { ignoreCase: true });
  }
}
