// === GAME DATA ===
// DaggerHeart-inspired card RPG data

export const CLASSES = {
  warrior: {
    name: 'Krieger',
    icon: '⚔️',
    description: 'Ein unerschütterlicher Kämpfer, der Feinde mit roher Kraft zertrümmert.',
    baseHp: 35,
    baseMana: 10,
    skills: ['Schwerthieb', 'Abwehrstand', 'Wutanfall', 'Schlachten'],
    startingDeck: [
      { name: 'Kleiner Hieb', cost: 0, type: 'attack', value: 6, icon: '🗡️', description: 'Ein schneller Stoß.' },
      { name: 'Kleiner Hieb', cost: 0, type: 'attack', value: 6, icon: '🗡️', description: 'Ein schneller Stoß.' },
      { name: 'Kleiner Hieb', cost: 0, type: 'attack', value: 6, icon: '🗡️', description: 'Ein schneller Stoß.' },
      { name: 'Block', cost: 0, type: 'defend', value: 5, icon: '🛡️', description: 'Reduziert Schaden.' },
      { name: 'Block', cost: 0, type: 'defend', value: 5, icon: '🛡️', description: 'Reduziert Schaden.' },
      { name: 'Großer Hieb', cost: 2, type: 'attack', value: 12, icon: '⚔️', description: 'Starker Angriff.' },
      { name: 'Schwere Faust', cost: 1, type: 'attack', value: 8, icon: '👊', description: 'Ein starker Schlag.' },
      { name: 'Unbeugsam', cost: 1, type: 'defend', value: 8, icon: '🛡️', description: 'Starke Abwehr.' },
    ],
  },
  mage: {
    name: 'Magier',
    icon: '🔮',
    description: 'Ein Meister der Elemente, der Feinde aus der Distanz vernichtet.',
    baseHp: 25,
    baseMana: 25,
    skills: ['Feuerball', 'Eisschild', 'Blitz', 'Sturm'],
    startingDeck: [
      { name: 'Funke', cost: 0, type: 'attack', value: 5, icon: '✨', description: 'Ein kleiner Magieschlag.' },
      { name: 'Funke', cost: 0, type: 'attack', value: 5, icon: '✨', description: 'Ein kleiner Magieschlag.' },
      { name: 'Funke', cost: 0, type: 'attack', value: 5, icon: '✨', description: 'Ein kleiner Magieschlag.' },
      { name: 'Funke', cost: 0, type: 'attack', value: 5, icon: '✨', description: 'Ein kleiner Magieschlag.' },
      { name: 'Mana-Block', cost: 0, type: 'defend', value: 4, icon: '🔰', description: 'Magische Barriere.' },
      { name: 'Magierfaust', cost: 1, type: 'attack', value: 8, icon: '🔥', description: 'Feuermagie.' },
      { name: 'Feuerball', cost: 3, type: 'attack', value: 18, icon: '🔥', description: 'Zerstörerische Flamme!' },
      { name: 'Sturmschlag', cost: 2, type: 'attack', value: 14, icon: '⚡', description: 'Blitzschlag.' },
    ],
  },
  rogue: {
    name: 'Schurke',
    icon: '🗡️',
    description: 'Ein listiger Kämpfer, der mit Gift und Schnellangriffen operiert.',
    baseHp: 28,
    baseMana: 15,
    skills: ['Giftiger Stich', 'Ausweichen', 'Meisterfall', 'Hinterhalt'],
    startingDeck: [
      { name: 'Stich', cost: 0, type: 'attack', value: 5, icon: '🗡️', description: 'Ein schneller Stich.' },
      { name: 'Stich', cost: 0, type: 'attack', value: 5, icon: '🗡️', description: 'Ein schneller Stich.' },
      { name: 'Stich', cost: 0, type: 'attack', value: 5, icon: '🗡️', description: 'Ein schneller Stich.' },
      { name: 'Parade', cost: 0, type: 'defend', value: 4, icon: '🛡️', description: 'Schnelle Abwehr.' },
      { name: 'Stich', cost: 0, type: 'attack', value: 5, icon: '🗡️', description: 'Ein schneller Stich.' },
      { name: 'Giftiger Stich', cost: 1, type: 'attack', value: 8, icon: '☠️', description: 'Giftiger Angriff.' },
      { name: 'Dolchregen', cost: 2, type: 'attack', value: 16, icon: '🌧️', description: 'Dolche fliegen!' },
      { name: 'Ausweichen', cost: 1, type: 'defend', value: 10, icon: '💨', description: 'Weiche aus.' },
    ],
  },
};

export const ENEMIES = [
  {
    name: 'Schattenwolf',
    icon: '🐺',
    hp: 30,
    maxHp: 30,
    attack: 6,
    description: 'Ein Wolf aus purer Dunkelheit.',
    abilities: [
      { name: 'Zubeißen', damage: 6, icon: '🦷' },
      { name: 'Jaulen', damage: 4, icon: '🔊', buff: { type: 'attack', value: 3, turns: 2 } },
    ],
  },
  {
    name: 'Knocman',
    icon: '👤',
    hp: 45,
    maxHp: 45,
    attack: 8,
    description: 'Ein alter, knochiger Untoter.',
    abilities: [
      { name: 'Knochenhieb', damage: 8, icon: '💀' },
      { name: 'Schüttelfrost', damage: 5, icon: '❄️', debuff: { type: 'defend', value: 3, turns: 2 } },
    ],
  },
  {
    name: 'Feuervogel',
    icon: '🦅',
    hp: 25,
    maxHp: 25,
    attack: 10,
    description: 'Ein Vogel aus reinem Feuer.',
    abilities: [
      { name: 'Schnabelhieb', damage: 10, icon: '👁️' },
      { name: 'Feueratem', damage: 12, icon: '🔥' },
    ],
  },
  {
    name: 'Schleim',
    icon: '🟢',
    hp: 55,
    maxHp: 55,
    attack: 5,
    description: 'Ein widerstandsfähiger Schleim.',
    abilities: [
      { name: 'Zerplatz', damage: 5, icon: '💦' },
      { name: 'Säure', damage: 8, icon: '🧪', debuff: { type: 'defense', value: 5, turns: 2 } },
    ],
  },
  {
    name: 'Dunkelritter',
    icon: '🖤',
    hp: 80,
    maxHp: 80,
    attack: 12,
    description: 'Ein Ritter der finsteren Legion.',
    abilities: [
      { name: 'Schwerterkampf', damage: 12, icon: '⚔️' },
      { name: 'Dunkler Schluch', damage: 8, icon: '🌑', debuff: { type: 'attack', value: 5, turns: 2 } },
      { name: 'Schattenstoß', damage: 15, icon: '🗡️' },
    ],
    isBoss: true,
  },
  {
    name: 'Drache',
    icon: '🐉',
    hp: 120,
    maxHp: 120,
    attack: 15,
    description: 'Ein urtümlicher Drache.',
    abilities: [
      { name: 'Klauenangriff', damage: 15, icon: '🔥' },
      { name: 'Feueratem', damage: 20, icon: '🔥' },
      { name: 'Flügelstoß', damage: 12, icon: '🪽' },
      { name: 'DRAKISCHE WÜTE', damage: 25, icon: '🌋', special: true },
    ],
    isBoss: true,
  },
];

export const CARD_TYPES = {
  attack: { color: '#e74c3c', label: 'Angriff' },
  defend: { color: '#3498db', label: 'Abwehr' },
  skill: { color: '#9b59b6', label: 'Fähigkeit' },
  heal: { color: '#2ecc71', label: 'Heilung' },
};

export const DECK_BACK = {
  warrior: { bg: 'linear-gradient(135deg, #8B0000, #FF4500)', border: '#FFD700' },
  mage: { bg: 'linear-gradient(135deg, #4B0082, #8A2BE2)', border: '#00BFFF' },
  rogue: { bg: 'linear-gradient(135deg, #2F4F4F, #556B2F)', border: '#FFD700' },
};
