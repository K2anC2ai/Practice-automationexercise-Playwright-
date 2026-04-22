import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

// TC11, TC20
test.describe('Cart', () => {
  let homePage: HomePage;
  let authPage: AuthPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage     = new HomePage(page);
    authPage     = new AuthPage(page);
    productsPage = new ProductsPage(page);
    cartPage     = new CartPage(page);
    await homePage.goto();
  });

  // TC11: Subscription in Cart page
  // ต่างจาก TC10 (home page) ตรงที่ต้องไปหน้า cart ก่อน scroll down
  test('TC11: Verify Subscription in Cart page', async ({ page }) => {
    await homePage.cartBtn.click();
    await cartPage.expectCartPage();

    await cartPage.subscribeNewsletter(`cart_sub_${Date.now()}@test.com`);
    await cartPage.expectSubscribeSuccess();
  });

  // TC20: Search → Add to Cart → Login → Verify cart still has products
  // เทสว่า cart ไม่หายหลัง login (session/cart merge)
  test('TC20: Search Products and Verify Cart After Login', async ({ page, apiCreatedUser }) => {
    await test.step('Search and add products to cart (as guest)', async () => {
      await homePage.productsBtn.click();
      await productsPage.search('dress');

      const count = await productsPage.getSearchResultCount();
      expect(count).toBeGreaterThan(0);

      // เพิ่มสินค้าแรกจาก search result ลง cart
      await productsPage.hoverAndAddToCart(0);
      await productsPage.dismissModalViewCart();
    });

    await test.step('Verify product in cart before login', async () => {
      await cartPage.expectCartPage();
      await expect(cartPage.cartItems).not.toHaveCount(0);
    });

    await test.step('Login with existing account', async () => {
      await homePage.signupLoginBtn.click();
      await authPage.login(apiCreatedUser.email, apiCreatedUser.password);
      await homePage.expectLoggedInAs(apiCreatedUser.name);
    });

    await test.step('Verify cart still has products after login', async () => {
      await homePage.cartBtn.click();
      await cartPage.expectCartPage();
      // cart ต้องยังมีสินค้าอยู่หลัง login
      await expect(cartPage.cartItems).not.toHaveCount(0);
    });
  });
});
