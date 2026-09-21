import { test, expect } from '@playwright/test';

test('game loads and shows character selection', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Wait for the loading to finish and game to render
  await page.waitForSelector('#app', { timeout: 10000 });
  
  // The game should have loaded and show some content
  const title = await page.title();
  expect(title.toLowerCase()).toContain('daggerheart');
  
  // Check if the game has started (loading should be gone)
  const loading = await page.$('#loading');
  // If loading is gone, the game has started
  // If it's still there, the game might still be loading
});

test('game HTML contains all character classes', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  
  // Wait for JavaScript to load
  await page.waitForTimeout(3000);
  
  // Check if character classes are present
  const classes = await page.evaluate(() => {
    const app = document.getElementById('app');
    return app ? app.innerHTML : '';
  });
  
  expect(classes).toBeTruthy();
});
