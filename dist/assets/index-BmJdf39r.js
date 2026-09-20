(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();class g{constructor(){this.state="title",this.player=null,this.enemy=null,this.deck=[],this.hand=[],this.discard=[],this.turn=0,this.combatLog=[],this.shield=0,this.energy=0,this.maxEnergy=3,this.buffs=[],this.debuffs=[],this.stars=[],this.maxStars=5,this.currentWave=0,this.wavesCompleted=0,this.totalDamageDealt=0,this.totalDamageTaken=0,this.healTotal=0}rollD100(){return Math.floor(Math.random()*100)+1}rollModifier(e){return e===100?"spectacular":e>=99?"triumph":e>=95||e>=90?"success":e>=2?"failure":e>=1?"botch":"failure"}addStar(){return this.stars.length<this.maxStars?(this.stars.push(!0),!0):!1}spendStars(e){const t=Math.min(e,this.stars.length);return this.stars=this.stars.slice(t),t}initCharacter(e){const t=CLASSES[e];this.player={className:e,name:t.name,icon:t.icon,hp:t.baseHp,maxHp:t.baseHp,mana:t.baseMana,maxMana:t.baseMana,attack:3,skills:t.skills},this.deck=[...t.startingDeck].map((a,i)=>({...a,id:i,uuid:Math.random().toString(36).substr(2,9)})),this.shuffle(this.deck),this.state="combat",this.currentWave=0,this.wavesCompleted=0,this.totalDamageDealt=0,this.totalDamageTaken=0,this.healTotal=0,this.startCombat()}shuffle(e){for(let t=e.length-1;t>0;t--){const a=Math.floor(Math.random()*(t+1));[e[t],e[a]]=[e[a],e[t]]}}startCombat(){const e=this.currentWave%(ENEMIES.length-2),t=this.currentWave>=4;this.enemy={...ENEMIES[t?ENEMIES.length-1:e],currentHp:ENEMIES[t?ENEMIES.length-1:e].hp},this.hand=[],this.discardedCards=[],this.shield=0,this.energy=0,this.maxEnergy=3,this.buffs=[],this.debuffs=[],this.stars=[],this.combatLog=[],this.addLog("⚔️ Kampf gegen "+this.enemy.name+" beginnt!"),this.addLog("─────────────────────"),this.drawCards(5)}addLog(e){this.combatLog.push({message:e,time:this.turn,timestamp:Date.now()})}drawCards(e){const t=[];for(let a=0;a<e;a++){if(this.deck.length===0)if(this.discardedCards.length>0)this.deck=[...this.discardedCards],this.shuffle(this.deck),this.discardedCards=[];else break;t.push(this.deck.pop())}return this.hand.push(...t),t.length>0&&this.addLog(`🃏 ${t.length} Karte${t.length>1?"n":""} gezogen.`),t}playCard(e){const t=this.hand[e];if(!t)return!1;if(this.energy<t.cost)return this.addLog("❌ Nicht genug Energie!"),!1;this.energy-=t.cost,this.hand.splice(e,1);const a=this.rollD100(),i=Math.min(2,this.stars.length),r=this.spendStars(i),n=a+r,c=this.rollModifier(n);let o=1;switch(c==="spectacular"?o=3:c==="triumph"?o=2:c==="success"?o=1.5:c==="botch"&&(o=.5),t.type){case"attack":{const s=Math.round(t.value*o)+this.player.attack;if(r>0&&o>=1.5){this.stars=[];for(let m=0;m<3;m++)this.addStar();this.addLog("⭐⚡ Kritischer Treffer! +3 Sterne!")}else r>0&&o===1?this.addLog(`🎲 ${a}${r>0?` +${r}★`:""} = ${n} (Erfolg)`):o<1?this.addLog(`💥 Fehlschlag! Nur ${a}${r>0?` +${r}★`:""} = ${n}`):this.addLog(`🎲 ${a}${r>0?` +${r}★`:""} = ${n} (${c})`);const l=Math.max(1,s);this.enemy.currentHp-=l,this.totalDamageDealt+=l,this.addLog(`💥 ${t.icon} ${t.name} → ${l} Schaden!`),this.enemy.currentHp<=0&&this.enemyDefeated();break}case"defend":{const d=Math.round(t.value*o);this.shield+=d,o>=2?(this.addLog(`🛡️⚡ Kritischer Block! +${this.shield} Schild!`),this.stars=[],this.addStar()):this.addLog(`🛡️ ${t.icon} ${t.name} → +${d} Schild!`);break}case"skill":{const d=Math.round(t.value*o);this.enemy.currentHp-=d,this.totalDamageDealt+=d,this.addLog(`✨ ${t.icon} ${t.name} → ${d} Schaden!`),this.enemy.currentHp<=0&&this.enemyDefeated();break}case"heal":{const d=Math.round(t.value*o);this.player.hp=Math.min(this.player.maxHp,this.player.hp+d),this.healTotal+=d,this.addLog(`💚 ${t.icon} ${t.name} → +${d} HP!`);break}}return this.discardedCards.push(t),!0}endTurn(){this.turn++,this.addLog(""),this.addLog(`━━━ U${this.turn} ━━━`),this.drawCards(5-this.hand.length),this.energy=this.maxEnergy,this.processBuffs(),this.enemy&&this.enemy.currentHp>0&&setTimeout(()=>this.enemyTurn(),500)}processBuffs(){this.buffs=this.buffs.filter(e=>(e.type==="attack"&&(this.player.attack+=e.value),e.turns--,e.turns>0)),this.debuffs=this.debuffs.filter(e=>(e.turns--,e.turns>0))}enemyTurn(){if(!this.enemy||this.enemy.currentHp<=0)return;const e=Math.floor(Math.random()*this.enemy.abilities.length),t=this.enemy.abilities[e];let a=t.damage;this.rollD100()>=95?(a=Math.round(a*1.5),this.addLog(`⚠️ ${this.enemy.icon} ${this.enemy.name} führt ${t.icon} ${t.name} mit Kraft aus! (${a})`)):this.addLog(`⚠️ ${this.enemy.icon} ${this.enemy.name} führt ${t.icon} ${t.name} aus. (${a})`);const r=Math.min(this.shield,a);this.shield-=r;const n=a-r;n>0?(this.player.hp-=n,this.totalDamageTaken+=n,this.addLog(`❤️‍🔥 ${n} Schaden getroffen!`)):this.addLog("🛡️ Vollständig geblockt!"),t.debuff&&(this.debuffs.push({...t.debuff}),this.addLog(`📉 ${t.debuff.icon} ${t.name} wirkt!`)),this.player.hp<=0&&(this.player.hp=0,this.state="defeat")}enemyDefeated(){this.wavesCompleted++,this.addLog(""),this.addLog(`🏆 ${this.enemy.name} besiegt!`),this.addLog("");const e=Math.round(this.player.maxHp*.15);this.player.hp=Math.min(this.player.maxHp,this.player.hp+e),this.healTotal+=e,this.addLog(`💚 +${e} HP genesen.`),this.addRewardCard(),setTimeout(()=>{this.currentWave++,this.state="combat",this.startCombat()},1500)}addRewardCard(){const e=[{name:"Eiserne Faust",cost:0,type:"attack",value:7,icon:"👊",description:"Starker Hieb."},{name:"Stahlwall",cost:0,type:"defend",value:6,icon:"🛡️",description:"Solide Abwehr."},{name:"Wachstum",cost:0,type:"heal",value:8,icon:"💚",description:"Heilende Energie."},{name:"Giftklinge",cost:1,type:"attack",value:10,icon:"🗡️",description:"Vergifteter Angriff."},{name:"Feuerrad",cost:1,type:"attack",value:11,icon:"🔥",description:"Drehender Flammenangriff."},{name:"Wand der Sterne",cost:1,type:"defend",value:10,icon:"⭐",description:"Mächtiger Schutz."}],a={...e[Math.floor(Math.random()*e.length)],id:Date.now(),uuid:Math.random().toString(36).substr(2,9)};this.deck.unshift(a),this.addLog(`🎁 Neue Karte: ${a.icon} ${a.name}`)}getGameState(){return{state:this.state,player:this.player,enemy:this.enemy,hand:this.hand,energy:this.energy,maxEnergy:this.maxEnergy,shield:this.shield,deck:this.deck,discards:this.discardedCards.length,turn:this.turn,stars:this.stars,combatLog:this.combatLog,currentWave:this.currentWave,wavesCompleted:this.wavesCompleted,totalDamageDealt:this.totalDamageDealt,totalDamageTaken:this.totalDamageTaken,healTotal:this.healTotal,buffs:this.buffs,debuffs:this.debuffs}}}const p={warrior:{name:"Krieger",icon:"⚔️",desc:"Unerschütterlicher Kämpfer",color:"#e74c3c",hp:35,attack:"⚔️"},mage:{name:"Magier",icon:"🔮",desc:"Meister der Elemente",color:"#8e44ad",hp:25,attack:"🔥"},rogue:{name:"Schurke",icon:"🗡️",desc:"Listiger Angreifer",color:"#27ae60",hp:28,attack:"🗡️"}};class f{constructor(){this.engine=new g,this.state="title",this.selectedClass=null,this.selectedCardIndex=-1,this.diceRolling=!1,this.diceValue=0,this.diceResult="",this.animatingCard=!1,this.render(),this.setupKeyboard()}selectClass(e){this.selectedClass=e,this.engine.initCharacter(e),this.state="combat",this.render()}playCard(e){this.animatingCard||this.diceRolling||(this.animatingCard=!0,this.selectedCardIndex=e,this.performDiceRoll(()=>{this.engine.playCard(e),this.state=this.engine.state,this.render(),this.animatingCard=!1,this.state==="defeat"&&setTimeout(()=>this.render(),1e3)}))}endTurn(){this.animatingCard||(this.engine.endTurn(),this.state=this.engine.state,this.render())}restart(){this.engine=new g,this.state="title",this.selectedClass=null,this.selectedCardIndex=-1,this.render()}performDiceRoll(e){this.diceRolling=!0;let t=0;const a=10,i=setInterval(()=>{this.diceValue=Math.floor(Math.random()*100)+1,this.render(),t++,t>=a&&(clearInterval(i),this.diceRolling=!1,this.diceResult=this.engine.rollModifier(this.diceValue),setTimeout(e,300))},100)}setupKeyboard(){document.addEventListener("keydown",e=>{if(this.state!=="combat"){(e.key==="Enter"||e.key===" ")&&(this.state==="title"?this.selectClass("warrior"):(this.state==="defeat"||this.state==="victory")&&this.restart());return}const t=parseInt(e.key);t>=1&&t<=5&&this.engine.hand[t-1]?this.playCard(t-1):(e.key==="e"||e.key==="E"||e.key==="End")&&this.endTurn()})}render(){const e=document.getElementById("app");if(e){switch(this.state){case"title":e.innerHTML=this.renderTitle();break;case"character-select":e.innerHTML=this.renderCharacterSelect();break;case"combat":e.innerHTML=this.renderCombat();break;case"defeat":e.innerHTML=this.renderDefeat();break;case"victory":e.innerHTML=this.renderVictory();break}this.attachEvents()}}renderTitle(){return`
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
          animation: twinkle ${2+Math.random()*3}s ease-in-out infinite;
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
        <div class="stars-bg">${Array.from({length:100},()=>`<div class="star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s"></div>`).join("")}</div>
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
    `}renderCharacterSelect(){return`
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
          ${Object.entries(p).map(([e,t])=>`
            <div class="char-card ${e}-card" onclick="gameUI.selectClass('${e}')">
              <div class="icon">${t.icon}</div>
              <h3>${t.name}</h3>
              <p class="desc">${t.desc}</p>
              <div class="stats">
                <span class="stat">❤️ ${t.hp} HP</span>
                <span class="stat">${t.attack} Attacke</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `}renderCombat(){var i,r,n,c,o,d;const e=this.engine.getGameState();if(!e.player)return this.renderTitle();const t=Math.max(0,e.player.hp/e.player.maxHp*100),a=e.enemy?Math.max(0,e.enemy.currentHp/e.enemy.maxHp*100):0;return`
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
          <span class="wave-badge ${(i=e.enemy)!=null&&i.isBoss?"boss":""}">
            ${(r=e.enemy)!=null&&r.isBoss?"👑 BOSS":"Welle "+(e.currentWave+1)}
          </span>
          <div class="stats-bar">
            <span>U${e.turn}</span>
            <span>🃏 ${e.deck.length}</span>
            <span>🗑️ ${e.discards}</span>
          </div>
        </div>

        <div class="battle-field">
          <!-- Player -->
          <div class="player-area" id="player-area">
            <div class="area-icon">${e.player.icon}</div>
            <div class="area-name">${e.player.name}</div>
            <div class="hp-bar-container">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill hp" style="width: ${t}%"></div>
              </div>
              <div class="hp-text">${e.player.hp} / ${e.player.maxHp}</div>
            </div>
            ${e.shield>0?`<div class="shield-indicator"><span class="shield-count">🛡️ ${e.shield}</span></div>`:""}
            <div class="stars-row">
              ${Array.from({length:e.maxStars||5},(s,l)=>`
                <div class="star-dot ${l<e.stars.length?"active":""}"></div>
              `).join("")}
            </div>
            ${e.debuffs.length>0?`
              <div class="status-effects">
                ${e.debuffs.map(s=>`<span class="status-effect debuff">${s.icon||"📉"} ${s.type} ${s.turns}🕐</span>`).join("")}
              </div>
            `:""}
          </div>

          <!-- Center -->
          <div class="center-area">
            <div class="dice-display ${this.diceRolling?"rolling":""} ${this.diceResult==="triumph"||this.diceResult==="spectacular"?"triumph":""}" id="dice">
              ${this.diceRolling?"🎲":this.diceValue||"d100"}
            </div>
            <div class="dice-result-label">
              ${this.diceRolling?"Würfel rollt...":this.diceResult?this.diceResult:""}
            </div>
            <button class="btn-end-turn" id="btn-end-turn">Ende Turn →</button>
          </div>

          <!-- Enemy -->
          <div class="enemy-area" id="enemy-area">
            <div class="area-icon">${((n=e.enemy)==null?void 0:n.icon)||"❓"}</div>
            <div class="area-name">${((c=e.enemy)==null?void 0:c.name)||"---"}</div>
            <div class="hp-bar-container">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill enemy-hp" style="width: ${a}%"></div>
              </div>
              <div class="hp-text">${e.enemy?e.enemy.currentHp:0} / ${((o=e.enemy)==null?void 0:o.maxHp)||0}</div>
            </div>
            ${(d=e.enemy)!=null&&d.isBoss?'<div style="color:#e74c3c;font-size:0.8rem;margin-top:0.5rem;">⭐ BOSS ⭐</div>':""}
          </div>
        </div>

        <!-- Hand -->
        <div class="hand-area">
          <div class="hand-label">
            <span>🃏 Hand (${e.hand.length} Karten)</span>
            <div class="energy-display">
              ${Array.from({length:e.maxEnergy},(s,l)=>`
                <div class="energy-pip ${l<e.energy?"filled":""}"></div>
              `).join("")}
            </div>
          </div>
          <div class="hand-cards" id="hand-cards">
            ${e.hand.map((s,l)=>`
              <div class="card ${s.type}" onclick="gameUI.playCard(${l})" data-index="${l}">
                <div class="card-inner">
                  <span class="card-cost">${s.cost>0?"⚡"+s.cost:"⚡0"}</span>
                  <span class="card-icon">${s.icon}</span>
                  <span class="card-name">${s.name}</span>
                  <span class="card-value">${s.value}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Combat Log -->
        <div class="combat-log" id="combat-log">
          ${e.combatLog.slice(-30).map(s=>`
            <div class="log-entry ${s.message.includes("⚡")?"log-critical":""} ${s.message.includes("💥")?"log-damage":""} ${s.message.includes("💚")?"log-heal":""} ${s.message.includes("🛡️")?"log-block":""}">
              ${s.message}
            </div>
          `).join("")}
        </div>
      </div>
    `}renderDefeat(){return`
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
    `}renderVictory(){return`
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
    `}attachEvents(){const e=document.getElementById("btn-end-turn");e&&e.addEventListener("click",()=>this.endTurn());const t=document.getElementById("combat-log");t&&(t.scrollTop=t.scrollHeight)}}window.gameUI=new f;
