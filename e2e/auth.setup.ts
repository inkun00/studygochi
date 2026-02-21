import { test as setup, expect } from '@playwright/test';

const authFile = 'test-results/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    console.warn('E2E_TEST_EMAIL, E2E_TEST_PASSWORD 미설정 - 인증 테스트 스킵');
    return;
  }

  await page.goto('/auth/login');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();

  await expect(page).toHaveURL(/\/main\//, { timeout: 15000 });
  await page.context().storageState({ path: authFile });
});
