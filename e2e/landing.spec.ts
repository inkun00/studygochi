import { test, expect } from '@playwright/test';

test.describe('랜딩 페이지', () => {
  test('랜딩 페이지 로드 및 타이틀 표시', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'STUDY', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'GOTCHI', exact: true })).toBeVisible();
  });

  test('START 버튼 클릭 시 회원가입 페이지 이동', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('landing-start').click();
    await expect(page).toHaveURL('/auth/signup');
  });

  test('로그인 버튼 클릭 시 로그인 페이지 이동', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('landing-login').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('EggDevice 버튼 1,2 클릭 시 회원가입 이동', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('egg-btn-2').click();
    await expect(page).toHaveURL('/auth/signup');
  });

  test('EggDevice 버튼 3 클릭 시 로그인 이동', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('egg-btn-3').click();
    await expect(page).toHaveURL('/auth/login');
  });
});
