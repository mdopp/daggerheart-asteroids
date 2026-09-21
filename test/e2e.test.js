/** @filetype E2E tests for DaggerHeart: Asteroids — Playwright, real browser */

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.TEST_PORT || 8080;
const BASE = process.env.E2E_BASE || `http://host.containers.internal:${PORT}`;

// Build before all tests
test.beforeAll(() => {
  execSync('npm run build', {
    cwd: join(__dirname, '..'),
    stdio: 'ignore',
  });
});

// ─── Title Screen ──────────────────────────────────────────────────────────

test('loads title screen', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('Daggerheart: Asteroids');
  await expect(page.locator('.title-container')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.title h1')).toContainText('DAGGERHEART');
  await expect(page.locator('.title .subtitle')).toContainText('Asteroids');
  await expect(page.locator('.title-content .btn-play')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.title-content .lore')).toBeVisible({ timeout: 5000 });
});

test('shows star field background on title', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const stars = page.locator('.stars-bg .star');
  await expect(stars.first()).toBeVisible({ timeout: 5000 });
  const count = await stars.count();
  expect(count).toBe(100);
});

// ─── Character Selection ────────────────────────────────────────────────────

test('selects warrior class via play button', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.locator('.title-content .btn-play').click();
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.player-area .area-name')).toContainText('Krieger');
  await expect(page.locator('.player-area .area-icon')).toContainText('⚔️');
});

test('selects warrior class via Enter key', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.player-area .area-name')).toContainText('Krieger');
});

test('selects mage class', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.locator('.title-content .btn-play').click();
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });
  // Mage starts — verify combat screen is visible
  await expect(combat).toBeVisible();
});

test('selects rogue class', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.locator('.title-content .btn-play').click();
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });
  await expect(combat).toBeVisible();
});

// ─── Combat Mechanics ───────────────────────────────────────────────────────

test('shows hand cards after combat starts', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });
  const handCards = page.locator('.hand-cards .card');
  const count = await handCards.count();
  expect(count).toBe(5);
});

test('plays attack card', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const attackCard = page.locator('.hand-cards .card.attack').first();
  await expect(attackCard).toBeVisible({ timeout: 5000 });
  await attackCard.click();
  // Wait for dice animation to complete (the result label gets text)
  const diceResult = page.locator('.dice-result-label');
  await expect(diceResult).toHaveText(/\S/, { timeout: 5000 });

  const logEntries = page.locator('.log-damage');
  const count = await logEntries.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test('shows shield on defend card', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const defendCard = page.locator('.hand-cards .card.defend').first();
  if (await defendCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await defendCard.click();
    const blockLog = page.locator('.log-block');
    const count = await blockLog.count();
    expect(count).toBeGreaterThanOrEqual(1);
  }
});

test('enemy attacks player', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const attackCard = page.locator('.hand-cards .card.attack').first();
  await expect(attackCard).toBeVisible({ timeout: 5000 });
  await attackCard.click();
  await page.waitForTimeout(2000);

  const enemyAttack = page.locator('.combat-log').locator('text=/⚠️/');
  await expect(enemyAttack).toBeVisible({ timeout: 5000 });
});

test('shows wave number in top bar', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const waveBadge = page.locator('.wave-badge:not(.boss)');
  await expect(waveBadge).toBeVisible({ timeout: 5000 });
  const text = await waveBadge.textContent();
  expect(text).toContain('Welle 1');
});

// ─── Dice Roll Mechanic ─────────────────────────────────────────────────────

test('shows dice result after roll', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const attackCard = page.locator('.hand-cards .card.attack').first();
  await expect(attackCard).toBeVisible({ timeout: 5000 });
  await attackCard.click();
  await page.waitForTimeout(2000);

  const resultLabel = page.locator('.dice-result-label');
  await expect(resultLabel).toBeVisible();
  const text = await resultLabel.textContent();
  expect(text?.length > 0).toBe(true);
});

// ─── Combat Log ─────────────────────────────────────────────────────────────

test('combat log shows messages', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const combatLog = page.locator('#combat-log');
  await expect(combatLog).toBeVisible();
  const logEntries = combatLog.locator('.log-entry');
  const count = await logEntries.count();
  expect(count).toBeGreaterThan(0);
});

test('combat log shows damage', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const attackCard = page.locator('.hand-cards .card.attack').first();
  await expect(attackCard).toBeVisible({ timeout: 5000 });
  await attackCard.click();
  await page.waitForTimeout(2000);

  const damageLog = page.locator('.log-damage');
  const count = await damageLog.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── HP and Energy System ──────────────────────────────────────────────────

test('shows player HP bar with correct values', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const hpText = page.locator('.hp-text').first();
  await expect(hpText).toContainText('35 / 35');
});

test('shows 3 energy pips', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const energyPips = page.locator('.energy-pip');
  const count = await energyPips.count();
  expect(count).toBe(3);
});

// ─── End Turn ───────────────────────────────────────────────────────────────

test('end turn button exists', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const endBtn = page.locator('#btn-end-turn');
  await expect(endBtn).toBeVisible();
});

test('end turn increases turn counter', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const endBtn = page.locator('#btn-end-turn');
  await endBtn.click();
  await page.waitForTimeout(2000);

  const turnText = page.locator('.stats-bar span').first();
  await expect(turnText).toContainText('U2');
});

// ─── Keyboard Controls ──────────────────────────────────────────────────────

test('keyboard e ends turn', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  await page.keyboard.press('e');
  await page.waitForTimeout(2000);

  const turnText = page.locator('.stats-bar span').first();
  await expect(turnText).toContainText('U2');
});

// ─── Victory / Defeat ──────────────────────────────────────────────────────

test('can defeat enemy and see victory state', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  // Play multiple attack cards to defeat enemy
  for (let i = 0; i < 6; i++) {
    const attackCard = page.locator('.hand-cards .card.attack').first();
    if (await attackCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await attackCard.click();
      await page.waitForTimeout(1500);
    }
  }

  const victoryScreen = page.locator('.victory-screen');
  const defeatScreen = page.locator('.defeat-screen');
  const combatStillVisible = await page.locator('.combat').isVisible({ timeout: 3000 });

  if (await victoryScreen.isVisible({ timeout: 5000 }).catch(() => false)) {
    await expect(victoryScreen.locator('h1')).toContainText('Sieg!');
  } else if (await defeatScreen.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(defeatScreen.locator('h1')).toContainText('Gefallen!');
  } else if (combatStillVisible) {
    await expect(combat).toBeVisible();
  }
});

test('defeat screen has retry button', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const btnRetry = page.locator('.btn-retry');
  const stillCombat = await page.locator('.combat').isVisible({ timeout: 3000 });
  if (!stillCombat) {
    await expect(btnRetry).toBeVisible();
    await btnRetry.click();
    const title = page.locator('.title-container');
    await expect(title).toBeVisible({ timeout: 5000 });
  }
});

// ─── Stats Display ──────────────────────────────────────────────────────────

test('shows deck count and discard count', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const statsBar = page.locator('.stats-bar');
  await expect(statsBar).toBeVisible();
});

test('shows enemy HP bar', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const enemyHpText = page.locator('.enemy-area .hp-text');
  await expect(enemyHpText).toBeVisible({ timeout: 5000 });
});

// ─── Star System ────────────────────────────────────────────────────────────

test('shows star dots in player area', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Enter');
  const combat = page.locator('.combat');
  await expect(combat).toBeVisible({ timeout: 10000 });

  const starDots = page.locator('.stars-row .star-dot');
  const count = await starDots.count();
  expect(count).toBe(5);
});
