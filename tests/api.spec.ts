import { test, expect } from '@playwright/test';
import { generateUser } from '../data/user';

// API Test Suite — API 1 ถึง 14
// ใช้ Playwright's `request` fixture โดยตรง ไม่ต้องเปิด browser เลย
// แต่ละ test ตรวจ responseCode และ response body ตามที่ document ระบุ
test.describe('REST API Tests', () => {

  // ─── Products API ──────────────────────────────────────────────────────────

  test('API 1: GET /api/productsList returns 200 with product array', async ({ request }) => {
    const res = await request.get('/api/productsList');

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(Array.isArray(json.products)).toBe(true);
    expect(json.products.length).toBeGreaterThan(0);

    // ตรวจ structure ของ product object
    const product = json.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('brand');
    expect(product).toHaveProperty('category');
  });

  test('API 2: POST /api/productsList returns 405 (method not supported)', async ({ request }) => {
    const res = await request.post('/api/productsList');

    expect(res.status()).toBe(200); // HTTP layer ส่ง 200 แต่ responseCode ข้างใน 405
    const json = await res.json();
    expect(json.responseCode).toBe(405);
    expect(json.message).toContain('This request method is not supported');
  });

  // ─── Brands API ────────────────────────────────────────────────────────────

  test('API 3: GET /api/brandsList returns 200 with brands array', async ({ request }) => {
    const res = await request.get('/api/brandsList');

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(Array.isArray(json.brands)).toBe(true);
    expect(json.brands.length).toBeGreaterThan(0);
    expect(json.brands[0]).toHaveProperty('id');
    expect(json.brands[0]).toHaveProperty('brand');
  });

  test('API 4: PUT /api/brandsList returns 405 (method not supported)', async ({ request }) => {
    const res = await request.put('/api/brandsList');

    const json = await res.json();
    expect(json.responseCode).toBe(405);
    expect(json.message).toContain('This request method is not supported');
  });

  // ─── Search Product API ────────────────────────────────────────────────────

  test('API 5: POST /api/searchProduct with keyword returns matching products', async ({ request }) => {
    const res = await request.post('/api/searchProduct', {
      form: { search_product: 'top' },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(Array.isArray(json.products)).toBe(true);
    expect(json.products.length).toBeGreaterThan(0);
  });

  test('API 6: POST /api/searchProduct without parameter returns 400', async ({ request }) => {
    const res = await request.post('/api/searchProduct');

    const json = await res.json();
    expect(json.responseCode).toBe(400);
    expect(json.message).toContain('search_product parameter is missing');
  });

  // ─── Verify Login API ──────────────────────────────────────────────────────

  // API 7 ต้องมี user จริง — สร้างและลบใน test นี้เอง
  test('API 7: POST /api/verifyLogin with valid details returns 200', async ({ request }) => {
    const user = generateUser();

    // สร้าง user ก่อน
    await request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDate, birth_month: '6', birth_year: user.birthYear,
        firstname: user.firstName, lastname: user.lastName, company: user.company,
        address1: user.address1, address2: user.address2, country: user.country,
        state: user.state, city: user.city, zipcode: user.zipcode, mobile_number: user.mobileNumber,
      },
    });

    const res = await request.post('/api/verifyLogin', {
      form: { email: user.email, password: user.password },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(json.message).toBe('User exists!');

    // teardown
    await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });

  test('API 8: POST /api/verifyLogin without email returns 400', async ({ request }) => {
    const res = await request.post('/api/verifyLogin', {
      form: { password: 'somepassword' },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(400);
    expect(json.message).toContain('email or password parameter is missing');
  });

  test('API 9: DELETE /api/verifyLogin returns 405 (method not supported)', async ({ request }) => {
    const res = await request.delete('/api/verifyLogin');

    const json = await res.json();
    expect(json.responseCode).toBe(405);
    expect(json.message).toContain('This request method is not supported');
  });

  test('API 10: POST /api/verifyLogin with invalid details returns 404', async ({ request }) => {
    const res = await request.post('/api/verifyLogin', {
      form: { email: 'notexist@invalid.com', password: 'wrongpass' },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(404);
    expect(json.message).toBe('User not found!');
  });

  // ─── Account CRUD API ──────────────────────────────────────────────────────

  test('API 11: POST /api/createAccount returns 201 User created', async ({ request }) => {
    const user = generateUser();

    const res = await request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDate, birth_month: '6', birth_year: user.birthYear,
        firstname: user.firstName, lastname: user.lastName, company: user.company,
        address1: user.address1, address2: user.address2, country: user.country,
        state: user.state, city: user.city, zipcode: user.zipcode, mobile_number: user.mobileNumber,
      },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(201);
    expect(json.message).toBe('User created!');

    // teardown
    await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });

  test('API 12: DELETE /api/deleteAccount returns 200 Account deleted', async ({ request }) => {
    const user = generateUser();

    await request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDate, birth_month: '6', birth_year: user.birthYear,
        firstname: user.firstName, lastname: user.lastName, company: user.company,
        address1: user.address1, address2: user.address2, country: user.country,
        state: user.state, city: user.city, zipcode: user.zipcode, mobile_number: user.mobileNumber,
      },
    });

    const res = await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(json.message).toBe('Account deleted!');
  });

  test('API 13: PUT /api/updateAccount returns 200 User updated', async ({ request }) => {
    const user = generateUser();

    await request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDate, birth_month: '6', birth_year: user.birthYear,
        firstname: user.firstName, lastname: user.lastName, company: user.company,
        address1: user.address1, address2: user.address2, country: user.country,
        state: user.state, city: user.city, zipcode: user.zipcode, mobile_number: user.mobileNumber,
      },
    });

    const res = await request.put('/api/updateAccount', {
      form: {
        name: 'Updated Name', email: user.email, password: user.password,
        title: 'Mrs', birth_date: '20', birth_month: '3', birth_year: '1995',
        firstname: 'Updated', lastname: 'Name', company: 'New Corp',
        address1: '456 New Street', address2: '', country: 'Canada',
        state: 'Ontario', city: 'Toronto', zipcode: 'M5H 2N2', mobile_number: '0899999999',
      },
    });

    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(json.message).toBe('User updated!');

    // teardown
    await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });

  test('API 14: GET /api/getUserDetailByEmail returns 200 with user detail', async ({ request }) => {
    const user = generateUser();

    await request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDate, birth_month: '6', birth_year: user.birthYear,
        firstname: user.firstName, lastname: user.lastName, company: user.company,
        address1: user.address1, address2: user.address2, country: user.country,
        state: user.state, city: user.city, zipcode: user.zipcode, mobile_number: user.mobileNumber,
      },
    });

    const res = await request.get(`/api/getUserDetailByEmail?email=${encodeURIComponent(user.email)}`);

    const json = await res.json();
    expect(json.responseCode).toBe(200);
    expect(json.user).toBeDefined();
    expect(json.user.email).toBe(user.email);
    expect(json.user.name).toBe(user.name);

    // teardown
    await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
  });
});
