const config = {
  type: Phaser.AUTO,
  parent: "game",

  width: 390,
  height: 844,

  backgroundColor: "#141716",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: {
    create,
  },
};

new Phaser.Game(config);

function create() {
  const scene = this;

  let player = {
    day: 0,
    health: 100,
    strength: 20,
    respect: 10,
    money: 0,
  };

  // -------------------------
  // BACKGROUND / CELL
  // -------------------------

  scene.add.rectangle(195, 422, 390, 844, 0x111413);

  scene.add.rectangle(195, 245, 350, 310, 0x262b28)
    .setStrokeStyle(2, 0x3b403d);

  // Window
  scene.add.rectangle(290, 170, 72, 90, 0x0a0d0d)
    .setStrokeStyle(5, 0x454b47);

  for (let i = 0; i < 4; i++) {
    scene.add.rectangle(265 + i * 17, 170, 4, 88, 0x555b57);
  }

  // Bed
  scene.add.rectangle(112, 290, 140, 45, 0x383b36);
  scene.add.rectangle(112, 276, 136, 24, 0x686b61);

  // Player placeholder
  scene.add.circle(195, 235, 21, 0xb59a7b);
  scene.add.rectangle(195, 287, 48, 72, 0x5e6863);

  // -------------------------
  // HEADER
  // -------------------------

  const title = scene.add.text(24, 35, "PRISON 365", {
    fontFamily: "Arial",
    fontSize: "15px",
    color: "#8d938f",
    fontStyle: "bold",
    letterSpacing: 2,
  });

  const dayText = scene.add.text(24, 62, "", {
    fontFamily: "Arial",
    fontSize: "30px",
    color: "#ffffff",
    fontStyle: "bold",
  });

  // -------------------------
  // EVENT TEXT
  // -------------------------

  const eventText = scene.add.text(
    24,
    385,
    "Your sentence begins today.",
    {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#d4d7d4",
      wordWrap: { width: 342 },
      lineSpacing: 5,
    }
  );

  // -------------------------
  // STATS
  // -------------------------

  const statText = scene.add.text(24, 475, "", {
    fontFamily: "Arial",
    fontSize: "14px",
    color: "#b7bcb8",
    lineSpacing: 12,
  });

  // -------------------------
  // BUTTONS
  // -------------------------

  createButton(scene, 105, 660, "YARD", () => {
    player.respect += random(-2, 5);

    if (chance(0.18)) {
      player.health -= random(8, 25);
      setEvent("A fight breaks out in the yard. You get caught in it.");
    } else {
      setEvent("You spend some time outside with the other inmates.");
    }

    advanceDay();
  });

  createButton(scene, 285, 660, "GYM", () => {
    player.strength += random(1, 4);
    player.health -= random(0, 4);

    setEvent("You train until your arms start shaking.");
    advanceDay();
  });

  createButton(scene, 105, 730, "WORK", () => {
    player.money += random(2, 8);

    setEvent("Another shift. At least you're earning something.");
    advanceDay();
  });

  createButton(scene, 285, 730, "CELL", () => {
    player.health = Math.min(100, player.health + random(2, 8));

    setEvent("You stay in your cell and keep your head down.");
    advanceDay();
  });

  // -------------------------
  // GAME LOGIC
  // -------------------------

  function advanceDay() {
    player.day++;

    if (player.day >= 365) {
      setEvent("You made it. After 365 days, the gates finally open.");
    }

    if (player.health <= 0) {
      die();
      return;
    }

    updateUI();
  }

  function die() {
    const deathDay = player.day;

    scene.time.delayedCall(250, () => {
      eventText.setText(
        `YOU DIED ON DAY ${deathDay}.\n\nEverything is gone.\nYour sentence begins again.`
      );

      player = {
        day: 0,
        health: 100,
        strength: 20,
        respect: 10,
        money: 0,
      };

      updateUI();
    });
  }

  function setEvent(text) {
    eventText.setText(text);
  }

  function updateUI() {
    dayText.setText(`DAY ${player.day} / 365`);

    statText.setText(
      `HEALTH     ${player.health}\n` +
      `STRENGTH   ${player.strength}\n` +
      `RESPECT    ${player.respect}\n` +
      `MONEY      $${player.money}`
    );
  }

  updateUI();
}

function createButton(scene, x, y, label, callback) {
  const bg = scene.add
    .rectangle(x, y, 155, 52, 0x242826)
    .setStrokeStyle(1, 0x4b514d)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, {
      fontFamily: "Arial",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#ffffff",
    })
    .setOrigin(0.5);

  bg.on("pointerover", () => bg.setFillStyle(0x343a36));
  bg.on("pointerout", () => bg.setFillStyle(0x242826));

  bg.on("pointerdown", callback);
}

function random(min, max) {
  return Phaser.Math.Between(min, max);
}

function chance(probability) {
  return Math.random() < probability;
}
