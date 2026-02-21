import { test, expect } from '@playwright/test';

test.describe('메인 플로우 (인증 필요)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
      testInfo.skip();
      return;
    }
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    await page.goto('/auth/login');
    await page.getByTestId('auth-email').fill(email);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL(/\/main\//, { timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  test('로딩 후 홈/메뉴 화면 표시', async ({ page }) => {
    await page.goto('/main/study');
    await page.waitForTimeout(2000);
    const hasPetCreation = await page.getByRole('button', { name: /탄생/ }).isVisible().catch(() => false);
    const hasMenu = await page.getByTestId('menu-study').isVisible().catch(() => false);
    const hasHome = await page.getByTestId('egg-btn-1').isVisible().catch(() => false);
    expect(hasPetCreation || hasMenu || hasHome).toBeTruthy();
  });

  test('메뉴 열기 및 공부 메뉴 클릭', async ({ page }) => {
    await page.goto('/main/study');
    await page.waitForTimeout(2000);

    if (await page.getByRole('button', { name: /탄생/ }).isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await page.getByTestId('egg-btn-1').click();
    await page.waitForTimeout(500);
    await page.getByTestId('menu-study').click();
    await page.waitForTimeout(500);

    const studyArea = page.getByTestId('study-textarea').or(page.locator('textarea[placeholder*="가르쳐줄"]'));
    await expect(studyArea).toBeVisible({ timeout: 5000 });
  });

  test('공부 화면 - 편집/미리보기 전환', async ({ page }) => {
    await page.goto('/main/study');
    await page.waitForTimeout(2000);

    if (await page.getByRole('button', { name: /탄생/ }).isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await page.getByTestId('egg-btn-1').click();
    await page.waitForTimeout(300);
    await page.getByTestId('menu-study').click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: '미리보기' }).click();
    await expect(page.locator('div').filter({ hasText: /비어있음/ }).first()).toBeVisible({ timeout: 3000 });

    await page.getByRole('button', { name: '편집' }).click();
    await expect(page.getByTestId('study-textarea').or(page.locator('textarea'))).toBeVisible({ timeout: 3000 });
  });

  test('메뉴 - 시험, 교실, 상점, 노트 이동', async ({ page }) => {
    await page.goto('/main/study');
    await page.waitForTimeout(2000);

    if (await page.getByRole('button', { name: /탄생/ }).isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await page.getByTestId('egg-btn-1').click();
    await page.waitForTimeout(300);

    await page.getByTestId('menu-exam').click();
    await page.waitForTimeout(300);

    await page.getByTestId('egg-btn-1').click();
    await page.getByTestId('menu-classroom').click();
    await page.waitForTimeout(300);

    await page.getByTestId('egg-btn-1').click();
    await page.getByTestId('menu-shop').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/ITEMS|GEM PACKS|💎/')).toBeVisible({ timeout: 3000 });

    await page.getByTestId('egg-btn-1').click();
    await page.getByTestId('menu-logs').click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/노트|학습 기록/')).toBeVisible({ timeout: 3000 });
  });

  test('상태 화면 열기', async ({ page }) => {
    await page.goto('/main/study');
    await page.waitForTimeout(2000);

    if (await page.getByRole('button', { name: /탄생/ }).isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await page.getByTestId('egg-btn-1').click();
    await page.getByTestId('menu-status').click();
    await expect(page.locator('text=/경험치|배고픔|지능/')).toBeVisible({ timeout: 5000 });
  });
});
