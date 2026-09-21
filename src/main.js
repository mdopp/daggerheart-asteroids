// === MAIN UI ===
// Renders the full game UI with animations

import { GameEngine } from './engine.js';
import { ENEMIES } from './game-data.js';

// Game data CLASSES (from game-data.js for character select)
const CLASSES = {
  warrior: { name: 'Krieger', icon: '⚔️', desc: 'Unerschütterlicher Kämpfer', color: '#e74c3c', hp: 35, attack: '⚔️' },
  mage:    { name: 'Magier', icon: '🔮', desc: 'Meister der Elemente', color: '#8e44ad', hp: 25, attack: '🔥' },
  rogue:   { name: 'Schurke', icon: '🗡️', desc: 'Listiger Angreifer', color: '#27ae60', hp: 28, attack: '🗡️' },
};

// Expose for the bundled code
window.CLASSES = CLASSES;
window.ENEMIES = ENEMIES;
window.gameData = { CLASSES, ENEMIES };

export class GameUI {
  constructor() {
    this.engine = new GameEngine(CLASSES, ENEMIES);
    this.state = 'title';
    this.selectedClass = null;
    this.selectedCardIndex = -1;
    this.diceRolling = false;
    this.diceValue = 0;
    this.diceResult = '';
    this.animatingCard = false;

    this.render();
    this.setupKeyboard();
  }

  // === STATE TRANSITIONS ===

  selectClass(className) {
    this.selectedClass = className;
    this.engine.initCharacter(className);
    this.state = 'combat';
    this.render();
  }

  playCard(index) {
    if (this.animatingCard || this.diceRolling) return;
    this.animatingCard = true;
    this.selectedCardIndex = index;

    // Show dice roll animation
    this.performDiceRoll(() => {
      this.engine.playCard(index);
      this.state = this.engine.state;
      this.render();
      this.animatingCard = false;

      if (this.state === 'defeat') {
        setTimeout(() => this.render(), 1000);
      }
    });
  }

  endTurn() {
    if (this.animatingCard) return;
    this.engine.endTurn();
    this.state = this.engine.state;
    this.render();
  }

  restart() {
    this.engine = new GameEngine(CLASSES, ENEMIES);
    this.state = 'title';
    this.selectedClass = null;
    this.selectedCardIndex = -1;
    this.render();
  }

  // === DICE ROLLING ANIMATION ===

  performDiceRoll(onComplete) {
    this.diceRolling = true;
    let count = 0;
    const maxCount = 10;

    const interval = setInterval(() => {
      this.diceValue = Math.floor(Math.random() * 100) + 1;
      this.render();
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        this.diceRolling = false;
        this.diceResult = this.engine.rollModifier(this.diceValue);
        setTimeout(onComplete, 300);
      }
    }, 100);
  }

  // === KEYBOARD SUPPORT ===

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this.state !== 'combat') {
        if (e.key === 'Enter' || e.key === ' ') {
          if (this.state === 'title') {
            this.selectClass('warrior');
          } else if (this.state === 'defeat' || this.state === 'victory') {
            this.restart();
          }
        }
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 5 && this.engine.hand[num - 1]) {
        this.playCard(num - 1);
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'End') {
        this.endTurn();
      }
    });
  }

  // === RENDER ===

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    switch (this.state) {
      case 'title':
        app.innerHTML = this.renderTitle();
        break;
      case 'character-select':
        app.innerHTML = this.renderCharacterSelect();
        break;
      case 'combat':
        app.innerHTML = this.renderCombat();
        break;
      case 'defeat':
        app.innerHTML = this.renderDefeat();
        break;
      case 'victory':
        app.innerHTML = this.renderVictory();
        break;
    }

    this.attachEvents();
  }

  // === TITLE SCREEN ===

  renderTitle() {
    return `
      <style>
        .title-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0e0e0;
          position: relative;
          overflow: hidden;
        }

        .stars-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #fff;
          border-radius: 50%;
          animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        .title-content {
          position: relative;
          z-index: 1;
        }

        .title-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .title h1 {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, #FFD700, #FF6B35, #e74c3c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          letter-spacing: 0.05em;
        }

        .title .subtitle {
          font-size: 1.2rem;
          color: #aaa;
          margin-bottom: 3rem;
          font-weight: 300;
        }

        .title .btn-play {
          padding: 1rem 3rem;
          font-size: 1.3rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: #1a1a2e;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
        }

        .title .btn-play:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(255, 107, 53, 0.6);
        }

        .title .lore {
          margin-top: 3rem;
          max-width: 600px;
          font-size: 0.95rem;
          color: #888;
          line-height: 1.7;
        }

        .title .tags {
          margin-top: 1.5rem;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .title .tag {
          padding: 0.3rem 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 0.8rem;
          color: #aaa;
        }
      </style>
      <div class="title-container">
        <div class="stars-bg">${Array.from({length: 100}, () =>
          `<div class="star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s"></div>`
        ).join('')}</div>
        <div class="title-content">
          <div class="title-icon">⚔️</div>
          <div class="title">
            <h1>DAGGERHEART</h1>
            <p class="subtitle">Asteroids — Ein Hack & Slash Kartenspiel</p>
          </div>
          <button class="btn-play" onclick="gameUI.selectClass('warrior')">
            ⚔️ Abenteuer beginnen
          </button>
          <p class="lore">
            Die Sterne haben gesprochen. Eine dunkle Bedrohung erhebt sich aus den Asteroidenfeldern.
            Wähle deinen Helden und kämpfe dich durch Wellen finsterer Wesen.
            Wirf die Würfel, spiele deine Karten, und werde zum Legendenmacher.
          </p>
          <div class="tags">
            <span class="tag">🎲 d100 Würfel</span>
            <span class="tag">🃏 Karten-Combat</span>
            <span class="tag">👾 6 Gegner</span>
            <span class="tag">⭐ Kritische Sterne</span>
          </div>
        </div>
      </div>
    `;
  }

  // === CHARACTER SELECT ===

  renderCharacterSelect() {
    return `
      <style>
        .char-select {
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .char-select h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #FFD700;
        }

        .char-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          width: 100%;
        }

        .char-card {
          padding: 2rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255,255,255,0.1);
          text-align: center;
          background: rgba(255,255,255,0.05);
        }

        .char-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
        }

        .char-card .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .char-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .char-card .desc {
          color: #aaa;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .char-card .stats {
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 0.85rem;
        }

        .char-card .stat {
          padding: 0.3rem 0.8rem;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
        }

        .char-card.warrior-card:hover { border-color: #e74c3c; }
        .char-card.mage-card:hover { border-color: #8e44ad; }
        .char-card.rogue-card:hover { border-color: #27ae60; }
      </style>
      <div class="char-select">
        <h2>⚔️ Wähle deinen Helden</h2>
        <div class="char-grid">
          ${Object.entries(CLASSES).map(([key, cls]) => `
            <div class="char-card ${key}-card" onclick="gameUI.selectClass('${key}')">
              <div class="icon">${cls.icon}</div>
              <h3>${cls.name}</h3>
              <p class="desc">${cls.desc}</p>
              <div class="stats">
                <span class="stat">❤️ ${cls.hp} HP</span>
                <span class="stat">${cls.attack} Attacke</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // === COMBAT SCREEN ===

  renderCombat() {
    const gs = this.engine.getGameState();
    if (!gs.player) return this.renderTitle();

    const hpPercent = Math.max(0, (gs.player.hp / gs.player.maxHp) * 100);
    const enemyHpPercent = gs.enemy ? Math.max(0, (gs.enemy.currentHp / gs.enemy.maxHp) * 100) : 0;

    return `
      <style>
        .combat {
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
        }

        /* Top bar */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1.5rem;
          background: rgba(0,0,0,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .wave-badge {
          padding: 0.4rem 1rem;
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: #1a1a2e;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .wave-badge.boss {
          background: linear-gradient(135deg, #8e44ad, #e74c3c);
          color: #fff;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .stats-bar {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          font-size: 0.85rem;
        }

        .stats-bar span {
          color: #aaa;
        }

        /* Battle field */
        .battle-field {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 3rem;
          gap: 2rem;
          min-height: 400px;
        }

        /* Player area */
        .player-area, .enemy-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .area-icon {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }

        .area-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }

        /* HP bars */
        .hp-bar-container {
          width: 100%;
          max-width: 250px;
          margin-bottom: 0.5rem;
        }

        .hp-bar-bg {
          height: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          overflow: hidden;
        }

        .hp-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
        }

        .hp-bar-fill.hp {
          background: linear-gradient(90deg, #e74c3c, #ff6b6b);
        }

        .hp-bar-fill.enemy-hp {
          background: linear-gradient(90deg, #8e44ad, #a855f7);
        }

        .hp-text {
          font-size: 0.8rem;
          color: #aaa;
          text-align: center;
          margin-top: 0.3rem;
        }

        /* Shield indicator */
        .shield-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.85rem;
        }

        .shield-count {
          padding: 0.2rem 0.6rem;
          background: #3498db;
          color: #fff;
          border-radius: 10px;
          font-weight: 600;
        }

        /* Stars */
        .stars-row {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.5rem;
        }

        .star-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }

        .star-dot.active {
          background: #FFD700;
          border-color: #FFD700;
          box-shadow: 0 0 10px rgba(255,215,0,0.5);
        }

        /* Center area */
        .center-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .dice-display {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          border-radius: 16px;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          color: #FFD700;
          transition: all 0.3s ease;
        }

        .dice-display.rolling {
          animation: diceShake 0.1s ease-in-out infinite;
        }

        @keyframes diceShake {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .dice-display.triumph {
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: #1a1a2e;
          border-color: #FFD700;
          box-shadow: 0 0 30px rgba(255,215,0,0.5);
        }

        .dice-result-label {
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 0.3rem;
        }

        /* Hand */
        .hand-area {
          padding: 1rem 1.5rem 1.5rem;
          background: rgba(0,0,0,0.4);
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .hand-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
          font-size: 0.85rem;
          color: #aaa;
        }

        .energy-display {
          display: flex;
          gap: 0.3rem;
        }

        .energy-pip {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }

        .energy-pip.filled {
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          border-color: #FFD700;
          box-shadow: 0 0 8px rgba(255,215,0,0.4);
        }

        .hand-cards {
          display: flex;
          gap: 0.8rem;
          overflow-x: auto;
          padding: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Card styling */
        .card {
          width: 110px;
          height: 155px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          flex-shrink: 0;
        }

        .card:hover {
          transform: translateY(-15px);
          z-index: 10;
        }

        .card.played {
          animation: playCard 0.5s ease forwards;
        }

        @keyframes playCard {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2) translateY(-30px); opacity: 0.8; }
          100% { transform: scale(0.8) translateY(-60px); opacity: 0; }
        }

        .card-inner {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          border: 2px solid rgba(255,255,255,0.2);
        }

        .card.attack .card-inner {
          background: linear-gradient(135deg, #8b0000, #c0392b);
          border-color: #e74c3c;
        }

        .card.defend .card-inner {
          background: linear-gradient(135deg, #1a3a5c, #2980b9);
          border-color: #3498db;
        }

        .card.heal .card-inner {
          background: linear-gradient(135deg, #1a4a2e, #27ae60);
          border-color: #2ecc71;
        }

        .card.skill .card-inner {
          background: linear-gradient(135deg, #3a1a5c, #8e44ad);
          border-color: #9b59b6;
        }

        .card-cost {
          font-size: 0.9rem;
          font-weight: 800;
          color: #FFD700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .card-icon {
          font-size: 2.5rem;
        }

        .card-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: #fff;
          text-align: center;
          line-height: 1.2;
        }

        .card-value {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
        }

        /* End turn button */
        .btn-end-turn {
          padding: 0.8rem 2rem;
          font-size: 1rem;
          font-weight: 700;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.1);
          color: #e0e0e0;
          transition: all 0.3s ease;
        }

        .btn-end-turn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.5);
          transform: translateY(-2px);
        }

        /* Combat log */
        .combat-log {
          padding: 0.8rem 1.5rem;
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
          max-height: 150px;
          overflow-y: auto;
          font-size: 0.8rem;
          color: #aaa;
          line-height: 1.6;
        }

        .log-entry {
          padding: 0.2rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        .log-critical {
          color: #FFD700;
          font-weight: 700;
        }

        .log-damage {
          color: #e74c3c;
        }

        .log-heal {
          color: #2ecc71;
        }

        .log-block {
          color: #3498db;
        }

        /* Buff/debuff indicators */
        .status-effects {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .status-effect {
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-effect.buff {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .status-effect.debuff {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        /* Damage popup */
        .damage-popup {
          position: fixed;
          font-size: 2rem;
          font-weight: 800;
          pointer-events: none;
          animation: damageFloat 1s ease-out forwards;
          z-index: 100;
        }

        @keyframes damageFloat {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-60px); opacity: 0; }
        }

        /* Enemy attack animation */
        .enemy-attack {
          animation: enemyAttack 0.5s ease;
        }

        @keyframes enemyAttack {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .player-hit {
          animation: playerHit 0.5s ease;
        }

        @keyframes playerHit {
          0%, 100% { transform: translateX(0); filter: none; }
          25% { transform: translateX(-5px); filter: brightness(2) hue-rotate(180deg); }
          50% { transform: translateX(5px); filter: brightness(1.5); }
        }
      </style>
      <div class="combat">
        <div class="top-bar">
          <span class="wave-badge ${gs.enemy?.isBoss ? 'boss' : ''}">
            ${gs.enemy?.isBoss ? '👑 BOSS' : 'Welle ' + (gs.currentWave + 1)}
          </span>
          <div class="stats-bar">
            <span>U${gs.turn}</span>
            <span>🃏 ${gs.deck.length}</span>
            <span>🗑️ ${gs.discards}</span>
          </div>
        </div>

        <div class="battle-field">
          <!-- Player -->
          <div class="player-area" id="player-area">
            <div class="area-icon">${gs.player.icon}</div>
            <div class="area-name">${gs.player.name}</div>
            <div class="hp-bar-container">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill hp" style="width: ${hpPercent}%"></div>
              </div>
              <div class="hp-text">${gs.player.hp} / ${gs.player.maxHp}</div>
            </div>
            ${gs.shield > 0 ? `<div class="shield-indicator"><span class="shield-count">🛡️ ${gs.shield}</span></div>` : ''}
            <div class="stars-row">
              ${Array.from({length: gs.maxStars || 5}, (_, i) => `
                <div class="star-dot ${i < gs.stars.length ? 'active' : ''}"></div>
              `).join('')}
            </div>
            ${gs.debuffs.length > 0 ? `
              <div class="status-effects">
                ${gs.debuffs.map(d => `<span class="status-effect debuff">${d.icon || '📉'} ${d.type} ${d.turns}🕐</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Center -->
          <div class="center-area">
            <div class="dice-display ${this.diceRolling ? 'rolling' : ''} ${this.diceResult === 'triumph' || this.diceResult === 'spectacular' ? 'triumph' : ''}" id="dice">
              ${this.diceRolling ? '🎲' : (this.diceValue || 'd100')}
            </div>
            <div class="dice-result-label">
              ${this.diceRolling ? 'Würfel rollt...' : (this.diceResult ? this.diceResult : '')}
            </div>
            <button class="btn-end-turn" id="btn-end-turn">Ende Turn →</button>
          </div>

          <!-- Enemy -->
          <div class="enemy-area" id="enemy-area">
            <div class="area-icon">${gs.enemy?.icon || '❓'}</div>
            <div class="area-name">${gs.enemy?.name || '---'}</div>
            <div class="hp-bar-container">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill enemy-hp" style="width: ${enemyHpPercent}%"></div>
              </div>
              <div class="hp-text">${gs.enemy ? gs.enemy.currentHp : 0} / ${gs.enemy?.maxHp || 0}</div>
            </div>
            ${gs.enemy?.isBoss ? '<div style="color:#e74c3c;font-size:0.8rem;margin-top:0.5rem;">⭐ BOSS ⭐</div>' : ''}
          </div>
        </div>

        <!-- Hand -->
        <div class="hand-area">
          <div class="hand-label">
            <span>🃏 Hand (${gs.hand.length} Karten)</span>
            <div class="energy-display">
              ${Array.from({length: gs.maxEnergy}, (_, i) => `
                <div class="energy-pip ${i < gs.energy ? 'filled' : ''}"></div>
              `).join('')}
            </div>
          </div>
          <div class="hand-cards" id="hand-cards">
            ${gs.hand.map((card, i) => `
              <div class="card ${card.type}" onclick="gameUI.playCard(${i})" data-index="${i}">
                <div class="card-inner">
                  <span class="card-cost">${card.cost > 0 ? '⚡' + card.cost : '⚡0'}</span>
                  <span class="card-icon">${card.icon}</span>
                  <span class="card-name">${card.name}</span>
                  <span class="card-value">${card.value}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Combat Log -->
        <div class="combat-log" id="combat-log">
          ${gs.combatLog.slice(-30).map(entry => `
            <div class="log-entry ${entry.message.includes('⚡') ? 'log-critical' : ''} ${entry.message.includes('💥') ? 'log-damage' : ''} ${entry.message.includes('💚') ? 'log-heal' : ''} ${entry.message.includes('🛡️') ? 'log-block' : ''}">
              ${entry.message}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // === DEFEAT SCREEN ===

  renderDefeat() {
    return `
      <style>
        .defeat-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0e0e0;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(180deg, #1a0000 0%, #0a0a1a 50%, #000a1a 100%);
        }

        .defeat-screen h1 {
          font-size: 3rem;
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .defeat-screen .icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .defeat-screen .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
          max-width: 600px;
          width: 100%;
        }

        .defeat-screen .stat-box {
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .defeat-screen .stat-box .value {
          font-size: 2rem;
          font-weight: 800;
          color: #FFD700;
        }

        .defeat-screen .stat-box .label {
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 0.3rem;
        }

        .btn-retry {
          padding: 1rem 3rem;
          font-size: 1.2rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: #fff;
          transition: all 0.3s ease;
        }

        .btn-retry:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(231, 76, 60, 0.4);
        }
      </style>
      <div class="defeat-screen">
        <div class="icon">💀</div>
        <h1>Gefallen!</h1>
        <p style="color:#aaa;margin-bottom:2rem;">Dein Weg endet hier, aber die Sterne flüstern von einem neuen Anfang...</p>
        <div class="stats">
          <div class="stat-box">
            <div class="value">${this.engine.wavesCompleted}</div>
            <div class="label">Wellen besiegt</div>
          </div>
          <div class="stat-box">
            <div class="value">${this.engine.totalDamageDealt}</div>
            <div class="label">Schaden verursacht</div>
          </div>
          <div class="stat-box">
            <div class="value">${this.engine.turn}</div>
            <div class="label">Turns</div>
          </div>
        </div>
        <button class="btn-retry" onclick="gameUI.restart()">🔄 Erneut versuchen</button>
      </div>
    `;
  }

  // === VICTORY SCREEN ===

  renderVictory() {
    return `
      <style>
        .victory-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: #e0e0e0;
          text-align: center;
          padding: 2rem;
          background: linear-gradient(180deg, #1a1a00 0%, #0a0a1a 50%, #000a1a 100%);
        }

        .victory-screen h1 {
          font-size: 3rem;
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .victory-screen .icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .victory-screen .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
          max-width: 600px;
          width: 100%;
        }

        .victory-screen .stat-box {
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .victory-screen .stat-box .value {
          font-size: 2rem;
          font-weight: 800;
          color: #FFD700;
        }

        .victory-screen .stat-box .label {
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 0.3rem;
        }

        .btn-restart {
          padding: 1rem 3rem;
          font-size: 1.2rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: linear-gradient(135deg, #FFD700, #FF6B35);
          color: #1a1a2e;
          transition: all 0.3s ease;
        }

        .btn-restart:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(255, 107, 53, 0.4);
        }
      </style>
      <div class="victory-screen">
        <div class="icon">🏆</div>
        <h1>Sieg!</h1>
        <p style="color:#aaa;margin-bottom:2rem;">Die Sterne haben gesprochen — du hast die Dunkelheit besiegt!</p>
        <div class="stats">
          <div class="stat-box">
            <div class="value">${this.engine.wavesCompleted}</div>
            <div class="label">Wellen besiegt</div>
          </div>
          <div class="stat-box">
            <div class="value">${this.engine.totalDamageDealt}</div>
            <div class="label">Schaden verursacht</div>
          </div>
          <div class="stat-box">
            <div class="value">${this.engine.turn}</div>
            <div class="label">Turns</div>
          </div>
        </div>
        <button class="btn-restart" onclick="gameUI.restart()">🔄 Nochmal spielen</button>
      </div>
    `;
  }

  // === EVENT HANDLERS ===

  attachEvents() {
    const endBtn = document.getElementById('btn-end-turn');
    if (endBtn) {
      endBtn.addEventListener('click', () => this.endTurn());
    }

    // Scroll combat log to bottom
    const log = document.getElementById('combat-log');
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }
}

// Make gameUI globally accessible
window.gameUI = new GameUI();
