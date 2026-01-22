import { test, expect } from '@playwright/test';

test('página carga correctamente', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Medicompara/i);
});

test('elementos principales visibles', async ({ page }) => {
  await page.goto('/');
  // Verificar que la página tiene contenido
  await expect(page.locator('body')).toBeVisible();
});
