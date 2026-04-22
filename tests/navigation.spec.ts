import path from 'path';
import { test, expect } from '../fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

// TC6, 7, 10, 18, 25, 26: Navigation, Contact, Subscription, Scroll
test.describe('Navigation & UI Interactions', () => {
  let homePage: HomePage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage     = new HomePage(page);
    productsPage = new ProductsPage(page);
    cartPage     = new CartPage(page);
    await homePage.goto();
  });

  // TC6: Contact Us Form — file upload + browser dialog
  test('TC6: Contact Us Form with file upload', async ({ page }) => {
    await homePage.contactUsBtn.click();
    await expect(page).toHaveURL(/\/contact_us/);
    await expect(page.locator('h2.title.text-center:has-text("Get In Touch")')).toBeVisible();

    await page.locator('input[data-qa="name"]').fill('Test User');
    await page.locator('input[data-qa="email"]').fill('test@playwright.com');
    await page.locator('input[data-qa="subject"]').fill('Playwright Automation Test');
    await page.locator('textarea[data-qa="message"]').fill('This is a test message from Playwright automation suite.');

    // file upload
    const uploadInput = page.locator('input[name="upload_file"]');
    await uploadInput.setInputFiles(path.join(__dirname, '../fixtures/sample-upload.txt'));

    // browser dialog (alert) จะขึ้นหลัง submit — ต้องลงทะเบียน handler ก่อน click
    page.once('dialog', dialog => dialog.accept());
    await page.locator('input[data-qa="submit-button"]').click();

    await expect(
      page.locator('.status.alert.alert-success')
    ).toContainText('Success! Your details have been submitted successfully.');

    // กลับหน้าแรก
    await page.locator('a:has-text("Home")').click();
    await homePage.expectHomePageVisible();
  });

  // TC7: Verify Test Cases Page
  test('TC7: Verify Test Cases Page', async ({ page }) => {
    await homePage.testCasesBtn.click();
    await expect(page).toHaveURL(/\/test_cases/);
    // ตรวจสอบว่าหน้า test cases โหลดสำเร็จ
    await expect(page.locator('.title.text-center')).toContainText('Test Cases');
  });

  // TC10: Subscription in home page
  test('TC10: Verify Subscription in home page', async () => {
    await homePage.goto();

    await homePage.scrollToFooter();
    await expect(homePage.subscriptionHeading).toContainText('Subscription');

    await homePage.subscribe(`home_sub_${Date.now()}@test.com`);
    await homePage.expectSubscribeSuccess();
  });

  // TC18: View Category Products
  test('TC18: View Category Products', async ({ page }) => {
    await expect(page.locator('#accordian')).toBeVisible();

    await test.step('Click Women → Tops and verify category page', async () => {
      await productsPage.clickWomenCategory();
      await productsPage.clickWomenSubcategory('Tops');
      await expect(page).toHaveURL(/\/category_products\//);
      await productsPage.expectCategoryPageContains('Women');
    });

    await test.step('Click Men → Jeans and verify category page', async () => {
      await productsPage.clickMenSubcategory('Jeans');
      await expect(page).toHaveURL(/\/category_products\//);
      await productsPage.expectCategoryPageContains('Men');
    });
  });

  // TC25: Scroll Up using Arrow button
  // scroll ลง → ตรวจ SUBSCRIPTION → กด arrow → ตรวจ hero text
  test('TC25: Verify Scroll Up using Arrow button', async ({ page }) => {
    // scroll ลงด้านล่างสุด
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(homePage.subscriptionHeading).toContainText('Subscription');

    // กด scroll-up arrow (ปุ่มลูกศรมุมขวาล่าง)
    await homePage.scrollUpViaArrow();

    // ตรวจสอบว่า hero text กลับมาใน viewport
    await homePage.expectHeroTextVisible();
  });

  // TC26: Scroll Up without Arrow button (scroll manual)
  test('TC26: Verify Scroll Up without Arrow button', async ({ page }) => {
    // scroll ลงด้านล่างสุด
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(homePage.subscriptionHeading).toContainText('Subscription');

    // scroll กลับขึ้นด้านบนโดยไม่ใช้ arrow button
    await page.evaluate(() => window.scrollTo(0, 0));

    // ตรวจสอบ hero text
    await homePage.expectHeroTextVisible();
  });
});
