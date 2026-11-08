import { test, expect } from '@playwright/test';

test.describe('OpenForm Steps 2.0 Comprehensive Browser E2E Suite', () => {

  test('1. App Navigation, UI Controls & Mobile Responsiveness', async ({ page }) => {
    // 1. Visit root
    await page.goto('/');
    await expect(page).toHaveTitle(/OpenForm Steps/i);

    // Verify Brand & Version
    await expect(page.locator('text=OpenForm Steps').first()).toBeVisible();
    await expect(page.locator('text=v2.0.0').first()).toBeVisible();

    // 2. Navigation bar check
    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await expect(nav.getByRole('button', { name: /Templates/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Responses/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Cloud Forms/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Docs/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Examples/i })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Builder/i })).toBeVisible();

    // 3. Navigate to Templates
    await nav.getByRole('button', { name: /Templates/i }).click({ force: true });
    await expect(page.locator('h1')).toContainText(/Form Template Gallery/i);

    // 4. Navigate to Responses
    await nav.getByRole('button', { name: /Responses/i }).click({ force: true });
    await expect(page.locator('h1')).toContainText(/Local Response Inspector/i);

    // 5. Navigate to Docs
    await nav.getByRole('button', { name: /Docs/i }).click({ force: true });
    await expect(page.locator('h1')).toContainText(/OpenForm Steps Documentation/i);

    // 6. Navigate to Examples
    await nav.getByRole('button', { name: /Examples/i }).click({ force: true });
    await expect(page.locator('h1')).toContainText(/Developer Integration Examples/i);

    // 7. Theme Toggle Check
    const themeBtn = page.getByRole('button', { name: /Toggle color theme/i });
    await expect(themeBtn).toBeVisible();
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await themeBtn.click({ force: true });
    const isDarkAfterToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDarkAfterToggle).toBe(!initialIsDark);
    // Toggle back
    await themeBtn.click({ force: true });

    // 8. Test Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 });
    // Mobile navigation bar should be visible at top
    const mobileNav = page.locator('header .flex.md\\:hidden');
    await expect(mobileNav).toBeVisible();
    await mobileNav.getByRole('button', { name: 'Templates' }).click({ force: true });
    await expect(page.locator('h1')).toContainText(/Form Template Gallery/i);

    // Reset viewport to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('2. Form Builder Step Reordering & Accessible Confirmation Dialog', async ({ page }) => {
    await page.goto('/');

    // Ensure on Builder page and wait for module to hydrate
    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await nav.getByRole('button', { name: /Builder/i }).click({ force: true });
    await expect(page.locator('text=Loading module...')).not.toBeVisible();
    await expect(page.locator('text=Personal Info').first()).toBeVisible();

    // Verify steps and accessible reordering buttons
    await expect(page.getByRole('button', { name: /Delete step 1/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete step 2/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Move step 1 right/i })).toBeVisible();

    // Test Accessible Step Deletion with ConfirmationDialog
    await page.getByRole('button', { name: /Delete step 2/i }).click({ force: true });

    // ConfirmationDialog should appear
    const dialog = page.locator('div[role="alertdialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Delete Step', exact: true })).toBeVisible();

    // Click Keep Step - step 2 should still be present
    await dialog.getByRole('button', { name: /Keep Step/i }).click({ force: true });
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Delete step 2/i })).toBeVisible();

    // Test Preview Modal
    const previewBtn = page.getByRole('button', { name: /Preview Form/i });
    await expect(previewBtn).toBeVisible();
    await previewBtn.click({ force: true });

    const previewModal = page.locator('div[role="dialog"]');
    await expect(previewModal).toBeVisible();
    await expect(previewModal.getByText(/Interactive Preview:/i)).toBeVisible();

    // Close preview modal
    const closeBtn = previewModal.getByRole('button', { name: /Close preview modal/i });
    await closeBtn.click({ force: true });
    await expect(previewModal).not.toBeVisible();
  });

  test('3. Cloud Lifecycle: Registration, Publishing, Anonymous Submission & Response Storage', async ({ browser }) => {
    const timestamp = Date.now();
    const ownerEmail = `testuser_${timestamp}@example.com`;
    const ownerName = `Verified User ${timestamp}`;
    const ownerPassword = 'ValidPassword123!';

    // Context 1: Form Owner
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();

    await ownerPage.goto('/');

    // 1. Open AuthModal & Register
    await ownerPage.getByRole('button', { name: /Sign In/i }).click({ force: true });
    const authModal = ownerPage.locator('div[role="dialog"]');
    await expect(authModal).toBeVisible();

    // Switch to Register mode
    await authModal.getByRole('button', { name: /Create one/i }).click({ force: true });
    await expect(authModal.getByText(/Create OpenForm Cloud Account/i)).toBeVisible();

    // Fill registration form
    await authModal.getByPlaceholder('e.g. Jane Doe').fill(ownerName);
    await authModal.getByPlaceholder('you@company.com').fill(ownerEmail);
    await authModal.getByPlaceholder('At least 8 characters').fill(ownerPassword);
    await authModal.getByRole('button', { name: /Create Account/i }).click({ force: true });

    // Confirm successful sign in
    await expect(authModal).not.toBeVisible();
    await expect(ownerPage.getByTitle('Sign out of OpenForm Cloud')).toBeVisible();

    // 2. Go to Cloud Forms Dashboard
    const nav = ownerPage.locator('nav[aria-label="Main Navigation"]');
    await nav.getByRole('button', { name: /Cloud Forms/i }).click({ force: true });
    await expect(ownerPage.locator('h1')).toContainText(/Cloud Forms Dashboard/i);

    // 3. Create a New Cloud Form (loads automatically into builder)
    await ownerPage.getByRole('button', { name: /New Cloud Form/i }).click({ force: true });
    await expect(ownerPage.locator('text=Personal Info').first()).toBeVisible();

    // 4. Open Publish & Share Modal from Builder
    await ownerPage.getByRole('button', { name: /Publish & Share/i }).click({ force: true });
    const publishModal = ownerPage.locator('div[role="dialog"]');
    await expect(publishModal).toBeVisible();

    // Click 'published' status button
    await publishModal.getByRole('button', { name: 'published', exact: true }).click({ force: true });

    // Extract the public form URL
    const publicUrl = await publishModal.locator('input[readonly]').inputValue();
    expect(publicUrl).toContain('?form=');

    // Apply Settings
    await publishModal.getByRole('button', { name: /Apply Settings/i }).click({ force: true });
    await expect(publishModal).not.toBeVisible();

    // Context 2: Separate Anonymous Visitor Session
    const visitorContext = await browser.newContext();
    const visitorPage = await visitorContext.newPage();

    // Open public standalone form URL
    await visitorPage.goto(publicUrl);

    // Wait for form to load
    await expect(visitorPage.locator('form').first()).toBeVisible();

    // Fill out the step 1 fields
    const inputs = visitorPage.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const type = await input.getAttribute('type');
        if (type === 'email') {
          await input.fill('visitor@example.com');
        } else {
          await input.fill(`Test Answer ${i + 1}`);
        }
      }
    }

    // Advance through steps and submit
    let submitOrNext = visitorPage.getByRole('button', { name: /Submit|Next/i }).first();
    while (await submitOrNext.isVisible()) {
      const text = await submitOrNext.textContent();
      await submitOrNext.click({ force: true });
      if (text?.includes('Submit')) break;
      await visitorPage.waitForTimeout(300);
      submitOrNext = visitorPage.getByRole('button', { name: /Submit|Next/i }).first();
    }

    // Confirm Submission Received screen
    await expect(visitorPage.getByText(/Thank You!|Submission Received!/i)).toBeVisible();
    await expect(visitorPage.getByText(/Tracking ID:/i)).toBeVisible();

    await visitorContext.close();

    // Back to Context 1 (Owner): Check submissions in Cloud Dashboard
    await nav.getByRole('button', { name: /Cloud Forms/i }).click({ force: true });
    await expect(ownerPage.locator('h1')).toContainText(/Cloud Forms Dashboard/i);

    // Verify form card displays responses count
    const formCard = ownerPage.locator('.rounded-2xl.border').first();
    await expect(formCard.getByText('1 responses')).toBeVisible();

    // Open Data / Submissions Modal
    await formCard.getByRole('button', { name: /Data/i }).click({ force: true });
    const dataModal = ownerPage.locator('div[role="dialog"]');
    await expect(dataModal).toBeVisible();
    await expect(dataModal.getByText(/Submissions:/i)).toBeVisible();
    await expect(dataModal.locator('pre')).toBeVisible();

    // Clean up owner session
    await ownerContext.close();
  });

  test('4. Cross-Account Multi-Tenant Security & Tenant Isolation', async ({ browser, request }) => {
    const timestamp = Date.now();

    // Register User A (Alice)
    const aliceEmail = `alice_${timestamp}@example.com`;
    const aliceName = `Alice ${timestamp}`;
    const alicePassword = 'AliceSecurePassword123!';

    const aliceRes = await request.post('http://127.0.0.1:3001/api/auth/register', {
      data: { email: aliceEmail, password: alicePassword, name: aliceName },
    });
    expect(aliceRes.status()).toBe(201);
    const aliceData = await aliceRes.json();
    const aliceToken = aliceData.token;

    // Alice creates a private cloud form
    const formRes = await request.post('http://127.0.0.1:3001/api/forms', {
      headers: { Authorization: `Bearer ${aliceToken}` },
      data: { title: "Alice's Highly Confidential Form" },
    });
    expect(formRes.status()).toBe(201);
    const aliceFormData = await formRes.json();
    const aliceFormId = aliceFormData.id;

    // Register User B (Bob) in browser context
    const bobContext = await browser.newContext();
    const bobPage = await bobContext.newPage();

    const bobEmail = `bob_${timestamp}@example.com`;
    const bobName = `Bob ${timestamp}`;
    const bobPassword = 'BobSecurePassword123!';

    await bobPage.goto('/');

    // Bob signs in
    await bobPage.getByRole('button', { name: /Sign In/i }).click({ force: true });
    const authModal = bobPage.locator('div[role="dialog"]');
    await authModal.getByRole('button', { name: /Create one/i }).click({ force: true });
    await authModal.getByPlaceholder('e.g. Jane Doe').fill(bobName);
    await authModal.getByPlaceholder('you@company.com').fill(bobEmail);
    await authModal.getByPlaceholder('At least 8 characters').fill(bobPassword);
    await authModal.getByRole('button', { name: /Create Account/i }).click({ force: true });
    await expect(authModal).not.toBeVisible();

    // Bob visits Cloud Dashboard
    const nav = bobPage.locator('nav[aria-label="Main Navigation"]');
    await nav.getByRole('button', { name: /Cloud Forms/i }).click({ force: true });

    // Verify Bob CANNOT see Alice's form in the UI
    await expect(bobPage.getByText("Alice's Highly Confidential Form")).not.toBeVisible();
    await expect(bobPage.getByText(aliceFormId)).not.toBeVisible();

    // Attempt direct API penetration using Bob's JWT token
    const bobMeRes = await request.post('http://127.0.0.1:3001/api/auth/login', {
      data: { email: bobEmail, password: bobPassword },
    });
    const bobToken = (await bobMeRes.json()).token;

    // 1. Bob tries to GET Alice's form details
    const unauthorizedGet = await request.get(`http://127.0.0.1:3001/api/forms/${aliceFormId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(unauthorizedGet.status()).toBe(404); // Properly isolated: 404 (does not exist for Bob)

    // 2. Bob tries to access Alice's responses
    const unauthorizedSubmissions = await request.get(`http://127.0.0.1:3001/api/forms/${aliceFormId}/responses`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(unauthorizedSubmissions.status()).toBe(404);

    // 3. Bob tries to delete Alice's form
    const unauthorizedDelete = await request.delete(`http://127.0.0.1:3001/api/forms/${aliceFormId}`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    expect(unauthorizedDelete.status()).toBe(404);

    await bobContext.close();
  });
});
