import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { SignupFormPage } from '../pages/SignupFormPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// TC14, 15, 16, 23, 24: Checkout flows
// test.step() ใช้เพราะ flow ยาวมาก ทำให้ Playwright HTML report แสดงแต่ละขั้นตอน

// helper: เพิ่มสินค้าแรกจากหน้า products ลง cart
async function addFirstProductToCart(productsPage: ProductsPage) {
  await productsPage.goto();
  await productsPage.hoverAndAddToCart(0);
  await productsPage.dismissModalContinueShopping();
}

// helper: กรอก payment และตรวจสอบ order สำเร็จ
async function completePaymentAndVerify(checkoutPage: CheckoutPage) {
  await checkoutPage.fillCommentAndPlaceOrder();
  await checkoutPage.fillPaymentAndConfirm();
  await checkoutPage.expectOrderSuccess();
}

test.describe('Checkout Flows', () => {
  let homePage: HomePage;
  let authPage: AuthPage;
  let signupFormPage: SignupFormPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    homePage      = new HomePage(page);
    authPage      = new AuthPage(page);
    signupFormPage = new SignupFormPage(page);
    productsPage  = new ProductsPage(page);
    cartPage      = new CartPage(page);
    checkoutPage  = new CheckoutPage(page);
    await homePage.goto();
  });

  // TC14: Place Order — Register while Checkout
  // เพิ่มสินค้าเป็น guest → checkout → hit login gate → register → ซื้อ
  test('TC14: Place Order: Register while Checkout', async ({ page, userData }) => {
    await test.step('Add product to cart as guest', async () => {
      await addFirstProductToCart(productsPage);
    });

    await test.step('Go to cart and proceed to checkout (hit login gate)', async () => {
      await homePage.cartBtn.click();
      await cartPage.expectCartPage();
      await cartPage.proceedToCheckout();
      // modal ขึ้น ให้กด "Register / Login"
      await cartPage.clickRegisterLoginFromModal();
    });

    await test.step('Register new account', async () => {
      await authPage.expectSignupHeadingVisible();
      await authPage.initiateSignup(userData.name, userData.email);
      await signupFormPage.fillAndCreate(userData);
      await signupFormPage.expectAccountCreated();
      await signupFormPage.clickContinue();
      await homePage.expectLoggedInAs(userData.name);
    });

    await test.step('Return to cart and proceed to checkout', async () => {
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectCheckoutPage();
    });

    await test.step('Place order and pay', async () => {
      await completePaymentAndVerify(checkoutPage);
    });

    await test.step('Delete account', async () => {
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });

  // TC15: Place Order — Register before Checkout
  // register ก่อน → เพิ่มสินค้า → checkout → ซื้อ
  test('TC15: Place Order: Register before Checkout', async ({ page, userData }) => {
    await test.step('Register new account', async () => {
      await homePage.signupLoginBtn.click();
      await authPage.initiateSignup(userData.name, userData.email);
      await signupFormPage.fillAndCreate(userData);
      await signupFormPage.expectAccountCreated();
      await signupFormPage.clickContinue();
      await homePage.expectLoggedInAs(userData.name);
    });

    await test.step('Add product to cart', async () => {
      await addFirstProductToCart(productsPage);
    });

    await test.step('Proceed to checkout', async () => {
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectCheckoutPage();
    });

    await test.step('Place order and pay', async () => {
      await completePaymentAndVerify(checkoutPage);
    });

    await test.step('Delete account', async () => {
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });

  // TC16: Place Order — Login before Checkout
  // ใช้ apiCreatedUser (สร้างผ่าน API เร็วกว่า UI signup)
  test('TC16: Place Order: Login before Checkout', async ({ page, apiCreatedUser }) => {
    await test.step('Login with existing account', async () => {
      await homePage.signupLoginBtn.click();
      await authPage.login(apiCreatedUser.email, apiCreatedUser.password);
      await homePage.expectLoggedInAs(apiCreatedUser.name);
    });

    await test.step('Add product to cart', async () => {
      await addFirstProductToCart(productsPage);
    });

    await test.step('Proceed to checkout', async () => {
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectCheckoutPage();
    });

    await test.step('Place order and pay', async () => {
      await completePaymentAndVerify(checkoutPage);
    });

    await test.step('Delete account', async () => {
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });

  // TC23: Verify address details in checkout page
  // เทสว่า address ใน checkout ตรงกับที่ลงทะเบียนไว้
  // ต้อง register ผ่าน UI (ไม่ใช้ apiCreatedUser) เพราะ apiCreatedUser ไม่ได้ login ผ่าน UI
  test('TC23: Verify address details in checkout page', async ({ page, userData }) => {
    await test.step('Register and verify logged in', async () => {
      await homePage.signupLoginBtn.click();
      await authPage.initiateSignup(userData.name, userData.email);
      await signupFormPage.fillAndCreate(userData);
      await signupFormPage.expectAccountCreated();
      await signupFormPage.clickContinue();
    });

    await test.step('Add product and go to checkout', async () => {
      await addFirstProductToCart(productsPage);
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
    });

    await test.step('Verify delivery and billing address match registration data', async () => {
      await checkoutPage.expectCheckoutPage();
      await checkoutPage.expectDeliveryAddress(userData);
      await checkoutPage.expectBillingAddress(userData);
    });

    await test.step('Delete account', async () => {
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });

  // TC24: Download Invoice after purchase
  test('TC24: Download Invoice after purchase order', async ({ page, userData }) => {
    await test.step('Add product to cart as guest, then register at checkout gate', async () => {
      await addFirstProductToCart(productsPage);
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
      await cartPage.clickRegisterLoginFromModal();

      await authPage.initiateSignup(userData.name, userData.email);
      await signupFormPage.fillAndCreate(userData);
      await signupFormPage.expectAccountCreated();
      await signupFormPage.clickContinue();
    });

    await test.step('Complete checkout and payment', async () => {
      await homePage.cartBtn.click();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectCheckoutPage();
      await checkoutPage.fillCommentAndPlaceOrder();
      await checkoutPage.fillPaymentAndConfirm();
      await checkoutPage.expectOrderSuccess();
    });

    await test.step('Download invoice and verify file downloaded', async () => {
      const download = await checkoutPage.downloadInvoice();
      // ตรวจสอบ filename ว่าเป็นไฟล์ invoice
      expect(download.suggestedFilename()).toBeTruthy();
    });

    await test.step('Delete account', async () => {
      await checkoutPage.continueBtn.click();
      await homePage.deleteAccountBtn.click();
      await signupFormPage.expectAccountDeleted();
      await signupFormPage.clickContinue();
    });
  });
});
