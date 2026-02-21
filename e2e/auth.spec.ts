import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test('로그인 폼 렌더링', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByTestId('auth-email')).toBeVisible();
    await expect(page.getByTestId('auth-password')).toBeVisible();
    await expect(page.getByTestId('auth-submit')).toBeVisible();
  });

  test('폼 입력 및 제출 시도 (실패 케이스)', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByTestId('auth-email').fill('invalid@test.com');
    await page.getByTestId('auth-password').fill('wrongpassword');
    await page.getByTestId('auth-submit').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('회원가입 링크 클릭', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /회원가입/ }).click();
    await expect(page).toHaveURL('/auth/signup');
  });
});

test.describe('회원가입 페이지', () => {
  test('회원가입 폼 렌더링', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByPlaceholder('닉네임')).toBeVisible();
    await expect(page.getByTestId('auth-email')).toBeVisible();
    await expect(page.getByTestId('auth-password')).toBeVisible();
    await expect(page.getByTestId('auth-submit')).toBeVisible();
  });

  test('학생/교사 역할 선택', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('button', { name: /교사/ }).click();
    await page.getByRole('button', { name: /학생/ }).click();
    await expect(page.getByTestId('auth-submit')).toBeVisible();
  });

  test('로그인 링크 클릭', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('button', { name: /로그인/ }).click();
    await expect(page).toHaveURL('/auth/login');
  });
});
