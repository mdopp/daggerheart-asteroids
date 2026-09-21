// === GAME ENGINE ===
// Manages game state, combat, cards, and dice mechanics

export class GameEngine {
  constructor(classes, enemies) {
    this.classes = classes;
    this.enemies = enemies;
    this.state = 'title'; // title, character-select, combat, victory, defeat
    this.player = null;
    this.enemy = null;
    this.deck = [];
    this.hand = [];
    this.discard = [];
    this.turn = 0;
    this.combatLog = [];
    this.shield = 0;
    this.energy = 0;
    this.maxEnergy = 3;
    this.buffs = [];
    this.debuffs = [];
    this.stars = []; // for critical hits (daggerheart style)
    this.maxStars = 5;
    this.currentWave = 0;
    this.wavesCompleted = 0;
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.healTotal = 0;
  }

  // Roll a d100 like DaggerHeart
  rollD100() {
    return Math.floor(Math.random() * 100) + 1;
  }

  // DaggerHeart: 1 = fumble, 2-20 = botch, 99-100 = triumph, 100 = spectacular triumph
  rollModifier(result) {
    if (result === 100) return 'spectacular';
    if (result >= 99) return 'triumph';
    if (result >= 95) return 'success';
    if (result >= 90) return 'success';
    if (result >= 2) return 'failure';
    if (result >= 1) return 'botch';
    return 'failure';
  }

  // Add a star to the player's pool (daggerheart mechanic)
  addStar() {
    if (this.stars.length < this.maxStars) {
      this.stars.push(true);
      return true;
    }
    return false;
  }

  // Spend stars (each star adds +1 to roll)
  spendStars(count) {
    const spent = Math.min(count, this.stars.length);
    this.stars = this.stars.slice(spent);
    return spent;
  }

  initCharacter(className) {
    const template = this.classes[className];
    this.player = {
      className,
      name: template.name,
      icon: template.icon,
      hp: template.baseHp,
      maxHp: template.baseHp,
      mana: template.baseMana,
      maxMana: template.baseMana,
      attack: 3, // base attack bonus
      skills: template.skills,
    };

    // Build deck (shuffled)
    this.deck = [...template.startingDeck].map((card, i) => ({
      ...card,
      id: i,
      uuid: Math.random().toString(36).substr(2, 9),
    }));
    this.shuffle(this.deck);

    this.state = 'combat';
    this.currentWave = 0;
    this.wavesCompleted = 0;
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.healTotal = 0;
    this.startCombat();
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  startCombat() {
    // Select enemy based on wave
    const enemyIndex = this.currentWave % (this.enemies.length - 2); // Skip boss until later
    const isBossWave = this.currentWave >= 4;

    this.enemy = {
      ...this.enemies[isBossWave ? this.enemies.length - 1 : enemyIndex],
      currentHp: this.enemies[isBossWave ? this.enemies.length - 1 : enemyIndex].hp,
    };

    // Reset combat state
    this.hand = [];
    this.discardedCards = [];
    this.shield = 0;
    this.energy = 0;
    this.maxEnergy = 3;
    this.buffs = [];
    this.debuffs = [];
    this.stars = [];
    this.combatLog = [];
    this.addLog('⚔️ Kampf gegen ' + this.enemy.name + ' beginnt!');
    this.addLog('─────────────────────');

    // Draw initial hand
    this.drawCards(5);
  }

  addLog(message) {
    this.combatLog.push({
      message,
      time: this.turn,
      timestamp: Date.now(),
    });
  }

  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // Reshuffle discard
        if (this.discardedCards.length > 0) {
          this.deck = [...this.discardedCards];
          this.shuffle(this.deck);
          this.discardedCards = [];
        } else {
          break;
        }
      }
      drawn.push(this.deck.pop());
    }
    this.hand.push(...drawn);
    if (drawn.length > 0) {
      this.addLog(`🃏 ${drawn.length} Karte${drawn.length > 1 ? 'n' : ''} gezogen.`);
    }
    return drawn;
  }

  playCard(cardIndex) {
    const card = this.hand[cardIndex];
    if (!card) return false;

    if (this.energy < card.cost) {
      this.addLog('❌ Nicht genug Energie!');
      return false;
    }

    this.energy -= card.cost;
    this.hand.splice(cardIndex, 1);

    // Roll d100
    const roll = this.rollD100();
    const starsSpent = Math.min(2, this.stars.length);
    const starBonus = this.spendStars(starsSpent);
    const effectiveRoll = roll + starBonus;

    // Check for critical (daggerheart: 95+ = success, 99+ = triumph, 100 = spectacular)
    const result = this.rollModifier(effectiveRoll);
    let multiplier = 1;
    if (result === 'spectacular') multiplier = 3;
    else if (result === 'triumph') multiplier = 2;
    else if (result === 'success') multiplier = 1.5;
    else if (result === 'botch') multiplier = 0.5;

    // Apply card effect
    switch (card.type) {
      case 'attack': {
        const baseDamage = Math.round(card.value * multiplier);
        const totalDamage = baseDamage + this.player.attack;

        // Add star bonus
        if (starBonus > 0 && multiplier >= 1.5) {
          // Critical: add stars back
          this.stars = [];
          for (let i = 0; i < 3; i++) this.addStar();
          this.addLog('⭐⚡ Kritischer Treffer! +3 Sterne!');
        } else if (starBonus > 0 && multiplier === 1) {
          this.addLog(`🎲 ${roll}${starBonus > 0 ? ` +${starBonus}★` : ''} = ${effectiveRoll} (Erfolg)`);
        } else if (multiplier < 1) {
          this.addLog(`💥 Fehlschlag! Nur ${roll}${starBonus > 0 ? ` +${starBonus}★` : ''} = ${effectiveRoll}`);
        } else {
          this.addLog(`🎲 ${roll}${starBonus > 0 ? ` +${starBonus}★` : ''} = ${effectiveRoll} (${result})`);
        }

        const finalDamage = Math.max(1, totalDamage);
        this.enemy.currentHp -= finalDamage;
        this.totalDamageDealt += finalDamage;
        this.addLog(`💥 ${card.icon} ${card.name} → ${finalDamage} Schaden!`);

        if (this.enemy.currentHp <= 0) {
          this.enemyDefeated();
        }
        break;
      }
      case 'defend': {
        const shieldAmount = Math.round(card.value * multiplier);
        this.shield += shieldAmount;
        if (multiplier >= 2) {
          this.addLog(`🛡️⚡ Kritischer Block! +${this.shield} Schild!`);
          this.stars = [];
          this.addStar();
        } else {
          this.addLog(`🛡️ ${card.icon} ${card.name} → +${shieldAmount} Schild!`);
        }
        break;
      }
      case 'skill': {
        // Special abilities
        const damage = Math.round(card.value * multiplier);
        this.enemy.currentHp -= damage;
        this.totalDamageDealt += damage;
        this.addLog(`✨ ${card.icon} ${card.name} → ${damage} Schaden!`);
        if (this.enemy.currentHp <= 0) {
          this.enemyDefeated();
        }
        break;
      }
      case 'heal': {
        const healAmount = Math.round(card.value * multiplier);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.healTotal += healAmount;
        this.addLog(`💚 ${card.icon} ${card.name} → +${healAmount} HP!`);
        break;
      }
    }

    // Move card to discard
    this.discardedCards.push(card);
    return true;
  }

  endTurn() {
    this.turn++;
    this.addLog('');
    this.addLog(`━━━ U${this.turn} ━━━`);

    // Draw new hand
    this.drawCards(5 - this.hand.length);
    this.energy = this.maxEnergy;

    // Process buffs/debuffs
    this.processBuffs();

    // Enemy acts
    if (this.enemy && this.enemy.currentHp > 0) {
      setTimeout(() => this.enemyTurn(), 500);
    }
  }

  processBuffs() {
    // Apply temporary buffs
    this.buffs = this.buffs.filter(buff => {
      if (buff.type === 'attack') {
        this.player.attack += buff.value;
      }
      buff.turns--;
      return buff.turns > 0;
    });

    // Apply debuffs (they tick each turn)
    this.debuffs = this.debuffs.filter(debuff => {
      debuff.turns--;
      return debuff.turns > 0;
    });
  }

  enemyTurn() {
    if (!this.enemy || this.enemy.currentHp <= 0) return;

    const abilityIndex = Math.floor(Math.random() * this.enemy.abilities.length);
    const ability = this.enemy.abilities[abilityIndex];

    let damage = ability.damage;

    // Critical chance for enemy
    const enemyRoll = this.rollD100();
    if (enemyRoll >= 95) {
      damage = Math.round(damage * 1.5);
      this.addLog(`⚠️ ${this.enemy.icon} ${this.enemy.name} führt ${ability.icon} ${ability.name} mit Kraft aus! (${damage})`);
    } else {
      this.addLog(`⚠️ ${this.enemy.icon} ${this.enemy.name} führt ${ability.icon} ${ability.name} aus. (${damage})`);
    }

    // Apply shield
    const absorbed = Math.min(this.shield, damage);
    this.shield -= absorbed;
    const remaining = damage - absorbed;

    if (remaining > 0) {
      this.player.hp -= remaining;
      this.totalDamageTaken += remaining;
      this.addLog(`❤️‍🔥 ${remaining} Schaden getroffen!`);
    } else {
      this.addLog('🛡️ Vollständig geblockt!');
    }

    // Apply debuff if ability has one
    if (ability.debuff) {
      this.debuffs.push({ ...ability.debuff });
      this.addLog(`📉 ${ability.debuff.icon} ${ability.name} wirkt!`);
    }

    // Check player death
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.state = 'defeat';
    }
  }

  enemyDefeated() {
    this.wavesCompleted++;
    this.addLog('');
    this.addLog(`🏆 ${this.enemy.name} besiegt!`);
    this.addLog('');

    // Small heal between waves
    const healAmount = Math.round(this.player.maxHp * 0.15);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
    this.healTotal += healAmount;
    this.addLog(`💚 +${healAmount} HP genesen.`);

    // Add a reward card
    this.addRewardCard();

    setTimeout(() => {
      this.currentWave++;
      this.state = 'combat';
      this.startCombat();
    }, 1500);
  }

  addRewardCard() {
    const rewards = [
      { name: 'Eiserne Faust', cost: 0, type: 'attack', value: 7, icon: '👊', description: 'Starker Hieb.' },
      { name: 'Stahlwall', cost: 0, type: 'defend', value: 6, icon: '🛡️', description: 'Solide Abwehr.' },
      { name: 'Wachstum', cost: 0, type: 'heal', value: 8, icon: '💚', description: 'Heilende Energie.' },
      { name: 'Giftklinge', cost: 1, type: 'attack', value: 10, icon: '🗡️', description: 'Vergifteter Angriff.' },
      { name: 'Feuerrad', cost: 1, type: 'attack', value: 11, icon: '🔥', description: 'Drehender Flammenangriff.' },
      { name: 'Wand der Sterne', cost: 1, type: 'defend', value: 10, icon: '⭐', description: 'Mächtiger Schutz.' },
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const card = { ...reward, id: Date.now(), uuid: Math.random().toString(36).substr(2, 9) };
    this.deck.unshift(card);
    this.addLog(`🎁 Neue Karte: ${card.icon} ${card.name}`);
  }

  getGameState() {
    return {
      state: this.state,
      player: this.player,
      enemy: this.enemy,
      hand: this.hand,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      shield: this.shield,
      deck: this.deck,
      discards: this.discardedCards.length,
      turn: this.turn,
      stars: this.stars,
      combatLog: this.combatLog,
      currentWave: this.currentWave,
      wavesCompleted: this.wavesCompleted,
      totalDamageDealt: this.totalDamageDealt,
      totalDamageTaken: this.totalDamageTaken,
      healTotal: this.healTotal,
      buffs: this.buffs,
      debuffs: this.debuffs,
    };
  }
}
