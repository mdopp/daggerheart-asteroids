/** @filetype Unit tests for game-data — data validation, no network */

import { test, expect } from 'vitest';
import { CLASSES, ENEMIES, CARD_TYPES, DECK_BACK } from '../src/game-data.js';

// ─── Classes ────────────────────────────────────────────────────────────────

test('CLASSES has exactly 3 entries', () => {
  expect(Object.keys(CLASSES)).toHaveLength(3);
  expect(CLASSES).toHaveProperty('warrior');
  expect(CLASSES).toHaveProperty('mage');
  expect(CLASSES).toHaveProperty('rogue');
});

test('each class has required fields', () => {
  for (const [key, cls] of Object.entries(CLASSES)) {
    expect(cls).toHaveProperty('name');
    expect(cls).toHaveProperty('icon');
    expect(cls).toHaveProperty('description');
    expect(cls).toHaveProperty('baseHp');
    expect(cls).toHaveProperty('baseMana');
    expect(cls).toHaveProperty('skills');
    expect(cls).toHaveProperty('startingDeck');
    expect(typeof cls.name).toBe('string');
    expect(typeof cls.icon).toBe('string');
    expect(cls.baseHp).toBeGreaterThan(0);
    expect(cls.baseMana).toBeGreaterThan(0);
    expect(Array.isArray(cls.skills)).toBe(true);
    expect(cls.skills.length).toBeGreaterThan(0);
    expect(Array.isArray(cls.startingDeck)).toBe(true);
  }
});

test('warrior has highest HP', () => {
  expect(CLASSES.warrior.baseHp).toBe(35);
  expect(CLASSES.warrior.baseHp).toBeGreaterThan(CLASSES.mage.baseHp);
  expect(CLASSES.warrior.baseHp).toBeGreaterThan(CLASSES.rogue.baseHp);
});

test('rogue has middle HP', () => {
  expect(CLASSES.rogue.baseHp).toBe(28);
});

test('mage has lowest HP', () => {
  expect(CLASSES.mage.baseHp).toBe(25);
});

test('starting deck cards have required fields', () => {
  for (const [key, cls] of Object.entries(CLASSES)) {
    for (const card of cls.startingDeck) {
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('cost');
      expect(card).toHaveProperty('type');
      expect(card).toHaveProperty('value');
      expect(card).toHaveProperty('icon');
      expect(card).toHaveProperty('description');
      expect(['attack', 'defend', 'skill', 'heal']).toContain(card.type);
      expect(typeof card.cost).toBe('number');
      expect(card.cost).toBeGreaterThanOrEqual(0);
      expect(card.cost).toBeLessThanOrEqual(5);
    }
  }
});

// ─── Enemies ────────────────────────────────────────────────────────────────

test('ENEMIES has exactly 6 entries', () => {
  expect(ENEMIES).toHaveLength(6);
});

test('each enemy has required fields', () => {
  for (const enemy of ENEMIES) {
    expect(enemy).toHaveProperty('name');
    expect(enemy).toHaveProperty('icon');
    expect(enemy).toHaveProperty('hp');
    expect(enemy).toHaveProperty('maxHp');
    expect(enemy).toHaveProperty('attack');
    expect(enemy).toHaveProperty('description');
    expect(enemy).toHaveProperty('abilities');
    expect(enemy.hp).toBe(enemy.maxHp);
    expect(enemy.attack).toBeGreaterThan(0);
    expect(Array.isArray(enemy.abilities)).toBe(true);
    expect(enemy.abilities.length).toBeGreaterThan(0);
  }
});

test('boss enemies have isBoss = true', () => {
  const bosses = ENEMIES.filter(e => e.isBoss);
  expect(bosses).toHaveLength(2);
  for (const boss of bosses) {
    expect(boss.isBoss).toBe(true);
  }
  // Non-bosses should not have isBoss property
  const nonBosses = ENEMIES.filter(e => !e.isBoss);
  expect(nonBosses).toHaveLength(4);
});

test('boss enemies have higher HP than regular enemies', () => {
  const regularHps = ENEMIES.filter(e => !e.isBoss).map(e => e.hp);
  const bossHps = ENEMIES.filter(e => e.isBoss).map(e => e.hp);
  const minBossHp = Math.min(...bossHps);
  const maxRegularHp = Math.max(...regularHps);
  expect(minBossHp).toBeGreaterThan(maxRegularHp);
});

test('each enemy ability has name and damage', () => {
  for (const enemy of ENEMIES) {
    for (const ability of enemy.abilities) {
      expect(ability).toHaveProperty('name');
      expect(ability).toHaveProperty('damage');
      expect(typeof ability.damage).toBe('number');
      expect(ability.damage).toBeGreaterThan(0);
    }
  }
});

// ─── CARD_TYPES ─────────────────────────────────────────────────────────────

test('CARD_TYPES has all 4 types', () => {
  expect(Object.keys(CARD_TYPES)).toHaveLength(4);
  expect(CARD_TYPES).toHaveProperty('attack');
  expect(CARD_TYPES).toHaveProperty('defend');
  expect(CARD_TYPES).toHaveProperty('skill');
  expect(CARD_TYPES).toHaveProperty('heal');
});

test('each card type has color and label', () => {
  for (const [key, type] of Object.entries(CARD_TYPES)) {
    expect(type).toHaveProperty('color');
    expect(type).toHaveProperty('label');
    expect(typeof type.color).toBe('string');
    expect(typeof type.label).toBe('string');
  }
});

// ─── DECK_BACK ──────────────────────────────────────────────────────────────

test('DECK_BACK has all 3 class entries', () => {
  expect(Object.keys(DECK_BACK)).toHaveLength(3);
  for (const [key, back] of Object.entries(DECK_BACK)) {
    expect(back).toHaveProperty('bg');
    expect(back).toHaveProperty('border');
  }
});
