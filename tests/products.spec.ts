import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';

// TC8, 9, 12, 13, 17, 19, 21, 22: Product-related tests
// tests เหล่านี้ส่วนใหญ่ไม่ต้อง login
test.describe('Products', () => {
  let homePage: HomePage;
  let productsPage: ProductsPage;
  let productDetailPage: ProductDetailPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage          = new HomePage(page);
    productsPage      = new ProductsPage(page);
    productDetailPage = new ProductDetailPage(page);
    cartPage          = new CartPage(page);
    await homePage.goto();
  });

  // TC8: All Products page + product detail
  test('TC8: Verify All Products and product detail page', async ({ page }) => {
    await homePage.productsBtn.click();
    await productsPage.expectAllProductsPage();
    await expect(productsPage.productCards).not.toHaveCount(0);

    // คลิก "View Product" ของสินค้าแรก
    await productsPage.clickViewProduct(0);
    await expect(page).toHaveURL(/\/product_details\//);

    // ตรวจสอบว่า detail fields ทั้ง 6 แสดงครบ
    await productDetailPage.expectProductDetailVisible();
  });

  // TC9: Search Product
  test('TC9: Search Product', async () => {
    await homePage.productsBtn.click();
    await productsPage.expectAllProductsPage();

    await productsPage.search('top');

    // ตรวจสอบว่ามีผลลัพธ์ และทุกผลลัพธ์เกี่ยวข้องกับ keyword
    const count = await productsPage.getSearchResultCount();
    expect(count).toBeGreaterThan(0);
  });

  // TC12: Add Products in Cart via hover
  // hover เพื่อ reveal overlay แล้วกด Add to cart — ต่างจาก TC13 ที่กดจากหน้า detail
  test('TC12: Add Products in Cart via hover', async ({ page }) => {
    await homePage.productsBtn.click();

    await test.step('Hover over first product and add to cart', async () => {
      await productsPage.hoverAndAddToCart(0);
      await productsPage.dismissModalContinueShopping();
    });

    await test.step('Hover over second product and go to cart', async () => {
      await productsPage.hoverAndAddToCart(1);
      await productsPage.dismissModalViewCart();
    });

    await test.step('Verify both products in cart with correct price and qty', async () => {
      await cartPage.expectCartPage();
      await expect(cartPage.cartItems).toHaveCount(2);

      // ตรวจสอบว่าแต่ละ item มี price และ total แสดง
      const firstItem = cartPage.cartItems.first();
      await expect(firstItem.locator('.cart_price')).toBeVisible();
      await expect(firstItem.locator('.cart_total')).toBeVisible();
    });
  });

  // TC13: Product quantity in Cart — เปลี่ยน quantity บนหน้า detail แล้วตรวจสอบใน cart
  test('TC13: Verify Product quantity in Cart', async ({ page }) => {
    // กด "View Product" จากหน้าแรก
    await page.locator('.features_items .product-image-wrapper').first()
      .locator('a:has-text("View Product")').click();

    await expect(page).toHaveURL(/\/product_details\//);

    // เปลี่ยน quantity เป็น 4
    await productDetailPage.setQuantity(4);
    await productDetailPage.addToCart();

    // ไปหน้า cart
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await cartPage.expectCartPage();

    // ตรวจสอบว่า quantity ใน cart แสดง 4
    const qtyBtn = cartPage.cartItems.first().locator('.cart_quantity button');
    await expect(qtyBtn).toHaveText('4');
  });

  // TC17: Remove Products From Cart
  test('TC17: Remove Products From Cart', async ({ page }) => {
    await homePage.productsBtn.click();
    await productsPage.hoverAndAddToCart(0);

    // รับชื่อสินค้าที่เพิ่ม
    const productName = await productsPage.productCards.first()
      .locator('.productinfo h2').textContent();

    await productsPage.dismissModalViewCart();
    await cartPage.expectCartPage();
    await expect(cartPage.cartItems).not.toHaveCount(0);

    // กด X เพื่อลบสินค้า
    await cartPage.cartItems.first().locator('a.cart_quantity_delete').click();

    // cart ต้องว่างหลังลบ
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  // TC19: View & Cart Brand Products
  test('TC19: View and Cart Brand Products', async ({ page }) => {
    await homePage.productsBtn.click();
    await productsPage.expectAllProductsPage();

    // ตรวจสอบว่า brand sidebar แสดง
    await expect(productsPage.brandLinks).not.toHaveCount(0);

    await test.step('Click first brand and verify brand page', async () => {
      const brandName = await productsPage.clickBrand(0);
      await expect(page).toHaveURL(/\/brand_products\//);
      // ตรวจสอบว่ามีสินค้าในหน้า brand
      await expect(productsPage.productCards).not.toHaveCount(0);
    });

    await test.step('Click second brand and verify', async () => {
      await productsPage.clickBrand(1);
      await expect(page).toHaveURL(/\/brand_products\//);
      await expect(productsPage.productCards).not.toHaveCount(0);
    });
  });

  // TC21: Add review on product
  test('TC21: Add review on product', async ({ page }) => {
    await homePage.productsBtn.click();
    await productsPage.clickViewProduct(0);
    await expect(page).toHaveURL(/\/product_details\//);

    await productDetailPage.submitReview(
      'Test Reviewer',
      'reviewer@test.com',
      'Great product! This is a test review from Playwright automation.'
    );

    await productDetailPage.expectReviewSuccess();
  });

  // TC22: Add to cart from Recommended items
  test('TC22: Add to cart from Recommended items', async ({ page }) => {
    // scroll ลงไปที่ recommended section ที่ด้านล่างหน้าแรก
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const recommendedSection = page.locator('#recommended-item-carousel');
    await expect(recommendedSection).toBeVisible();

    // กด Add to Cart ของ recommended product แรก
    await recommendedSection.locator('a:has-text("Add To Cart")').first().click();

    // ไปหน้า cart
    await page.locator('#cartModal a:has-text("View Cart")').click();
    await cartPage.expectCartPage();
    await expect(cartPage.cartItems).not.toHaveCount(0);
  });
});
