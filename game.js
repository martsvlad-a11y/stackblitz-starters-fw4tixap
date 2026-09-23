const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 390,
  height: 844,
  backgroundColor: '#0f1112',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: { create },
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

  drawCell(scene);
  const prisoner = drawPrisoner(scene, 224, 330);

  // Soft idle animation so the character feels alive.
  scene.tweens.add({
    targets: prisoner,
    y: prisoner.y - 1.8,
    duration: 1300,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut',
  });

  scene.add.text(22, 24, 'PRISON 365', {
    fontFamily: 'Arial',
    fontSize: '13px',
    color: '#9da39f',
    fontStyle: 'bold',
    letterSpacing: 2,
  });

  const dayText = scene.add.text(22, 47, '', {
    fontFamily: 'Arial',
    fontSize: '29px',
    color: '#f3f1e9',
    fontStyle: 'bold',
  });

  scene.add.text(22, 82, 'CELL B-17  •  NORTH WING', {
    fontFamily: 'Arial',
    fontSize: '10px',
    color: '#777e79',
    letterSpacing: 1,
  });

  // Lower information panel.
  const panel = scene.add.graphics();
  panel.fillStyle(0x121516, 0.98);
  panel.fillRoundedRect(14, 468, 362, 354, 18);
  panel.lineStyle(1, 0x2b3030, 1);
  panel.strokeRoundedRect(14, 468, 362, 354, 18);

  scene.add.text(28, 489, 'TODAY', {
    fontFamily: 'Arial',
    fontSize: '10px',
    color: '#747b76',
    fontStyle: 'bold',
    letterSpacing: 1.5,
  });

  const eventText = scene.add.text(28, 510, 'Your sentence begins today.', {
    fontFamily: 'Arial',
    fontSize: '15px',
    color: '#e0ded6',
    wordWrap: { width: 334 },
    lineSpacing: 5,
  });

  const statText = scene.add.text(28, 571, '', {
    fontFamily: 'Arial',
    fontSize: '12px',
    color: '#b8bdb9',
    lineSpacing: 8,
  });

  createButton(scene, 105, 697, 'YARD', 'Fresh air. More risk.', () => {
    player.respect += random(-2, 5);
    if (chance(0.18)) {
      player.health -= random(8, 25);
      setEvent('A fight breaks out in the yard. You get caught in it.');
    } else {
      setEvent('You spend an hour outside. The cold air feels almost normal.');
    }
    advanceDay();
  });

  createButton(scene, 285, 697, 'GYM', 'Strength up.', () => {
    player.strength += random(1, 4);
    player.health -= random(0, 4);
    setEvent('You train until your arms shake, then shower before lock-up.');
    advanceDay();
  });

  createButton(scene, 105, 767, 'WORK', 'Earn a little.', () => {
    player.money += random(2, 8);
    setEvent('Another shift. Boring work, but boredom can be useful in here.');
    advanceDay();
  });

  createButton(scene, 285, 767, 'CELL', 'Rest and recover.', () => {
    player.health = Math.min(100, player.health + random(2, 8));
    setEvent('You stay in, read for a while, and let the noise of the wing fade.');
    advanceDay();
  });

  function advanceDay() {
    player.day++;

    if (player.day >= 365) {
      setEvent('Day 365. The lock turns from the other side. You made it.');
    }

    if (player.health <= 0) {
      die();
      return;
    }

    updateUI();
  }

  function die() {
    const deathDay = player.day;

    eventText.setText(`YOU DIED ON DAY ${deathDay}.\n\nThe sentence starts again.`);

    scene.cameras.main.flash(500, 95, 20, 20);

    scene.time.delayedCall(900, () => {
      player = { day: 0, health: 100, strength: 20, respect: 10, money: 0 };
      updateUI();
    });
  }

  function setEvent(text) {
    eventText.setText(text);
  }

  function updateUI() {
    dayText.setText(`DAY ${player.day} / 365`);
    statText.setText(
      `HEALTH      ${String(player.health).padStart(3, ' ')}     ` +
      `STRENGTH   ${String(player.strength).padStart(3, ' ')}\n` +
      `RESPECT     ${String(player.respect).padStart(3, ' ')}     ` +
      `MONEY      $${player.money}`
    );
  }

  updateUI();
}

function drawCell(scene) {
  const g = scene.add.graphics();

  // Back wall: institutional concrete, but slightly warm rather than horror-grey.
  g.fillStyle(0x343936, 1);
  g.fillRect(0, 0, 390, 458);

  // Subtle concrete bands.
  g.lineStyle(1, 0x414743, 0.34);
  for (let y = 116; y < 430; y += 42) g.lineBetween(0, y, 390, y);
  for (let x = 54; x < 390; x += 84) g.lineBetween(x, 116, x, 430);

  // Ceiling shadow.
  g.fillStyle(0x161a19, 0.6);
  g.fillRect(0, 105, 390, 14);

  // Floor with perspective.
  g.fillStyle(0x232724, 1);
  g.fillPoints([
    new Phaser.Geom.Point(0, 389),
    new Phaser.Geom.Point(390, 389),
    new Phaser.Geom.Point(390, 458),
    new Phaser.Geom.Point(0, 458),
  ], true);
  g.lineStyle(1, 0x303530, 0.7);
  g.lineBetween(0, 423, 390, 423);
  g.lineBetween(91, 389, 70, 458);
  g.lineBetween(198, 389, 198, 458);
  g.lineBetween(307, 389, 327, 458);

  // High security window.
  g.fillStyle(0x171e20, 1);
  g.fillRect(246, 133, 105, 108);
  g.fillStyle(0x7895a0, 1);
  g.fillRect(254, 141, 89, 92);
  g.fillStyle(0xd6b36f, 0.18);
  g.fillRect(254, 141, 89, 92);

  g.lineStyle(5, 0x262b2b, 1);
  g.strokeRect(246, 133, 105, 108);
  g.lineStyle(3, 0x2d3333, 1);
  [267, 289, 311, 333].forEach((x) => g.lineBetween(x, 141, x, 233));
  g.lineBetween(254, 186, 343, 186);

  // Warm light cast from the window.
  g.fillStyle(0xd5b16d, 0.065);
  g.fillPoints([
    new Phaser.Geom.Point(254, 233),
    new Phaser.Geom.Point(343, 233),
    new Phaser.Geom.Point(390, 420),
    new Phaser.Geom.Point(227, 420),
  ], true);

  drawBed(scene, 25, 282);
  drawDesk(scene, 20, 180);
  drawSinkToilet(scene, 307, 303);
  drawShelfAndPhotos(scene);

  // Heavy cell door edge at far right.
  g.fillStyle(0x202423, 1);
  g.fillRect(367, 112, 23, 277);
  g.lineStyle(2, 0x4a504c, 1);
  g.lineBetween(367, 112, 367, 389);

  // Tiny warm ceiling fixture.
  g.fillStyle(0xd9c892, 0.9);
  g.fillRoundedRect(151, 112, 88, 8, 3);
  g.fillStyle(0xe6d79f, 0.05);
  g.fillEllipse(195, 206, 260, 210);
}

function drawBed(scene, x, y) {
  const g = scene.add.graphics();

  // Shadow under bed.
  g.fillStyle(0x080a09, 0.35);
  g.fillEllipse(x + 94, y + 112, 190, 28);

  // Steel frame.
  g.lineStyle(5, 0x171b1a, 1);
  g.strokeRoundedRect(x, y, 173, 67, 4);
  g.lineBetween(x + 8, y + 67, x + 8, y + 111);
  g.lineBetween(x + 165, y + 67, x + 165, y + 111);

  // Mattress.
  g.fillStyle(0x777b71, 1);
  g.fillRoundedRect(x + 5, y + 9, 163, 48, 5);

  // Blanket – desaturated olive gives the room a lived-in feel.
  g.fillStyle(0x596358, 1);
  g.fillRoundedRect(x + 8, y + 18, 115, 37, 4);
  g.lineStyle(1, 0x6e796d, 0.55);
  g.lineBetween(x + 22, y + 21, x + 22, y + 53);
  g.lineBetween(x + 72, y + 21, x + 72, y + 53);

  // Pillow.
  g.fillStyle(0xc2c0b5, 1);
  g.fillRoundedRect(x + 127, y + 16, 34, 26, 8);

  // Storage drawer beneath.
  g.fillStyle(0x313633, 1);
  g.fillRect(x + 29, y + 72, 108, 28);
  g.lineStyle(1, 0x4a504d, 1);
  g.strokeRect(x + 29, y + 72, 108, 28);
  g.lineBetween(x + 77, y + 86, x + 89, y + 86);
}

function drawDesk(scene, x, y) {
  const g = scene.add.graphics();

  // Wall-mounted steel desk.
  g.fillStyle(0x474c47, 1);
  g.fillRect(x, y, 126, 11);
  g.fillStyle(0x292d2a, 1);
  g.fillRect(x + 9, y + 11, 5, 60);
  g.fillRect(x + 111, y + 11, 5, 60);

  // Book + paper + mug.
  g.fillStyle(0x846f4d, 1);
  g.fillRect(x + 14, y - 8, 40, 8);
  g.fillStyle(0xc6c0aa, 1);
  g.fillRect(x + 59, y - 5, 34, 5);
  g.fillStyle(0x8d9994, 1);
  g.fillRoundedRect(x + 101, y - 15, 15, 15, 3);

  // Simple fixed stool.
  g.fillStyle(0x333835, 1);
  g.fillRoundedRect(x + 43, y + 78, 44, 9, 3);
  g.fillRect(x + 61, y + 87, 6, 32);
}

function drawSinkToilet(scene, x, y) {
  const g = scene.add.graphics();

  // Stainless steel sink.
  g.fillStyle(0x7f8988, 1);
  g.fillRoundedRect(x - 6, y - 78, 66, 40, 8);
  g.fillStyle(0x4f5958, 1);
  g.fillEllipse(x + 27, y - 60, 37, 15);
  g.fillStyle(0xa7afad, 1);
  g.fillRect(x + 20, y - 92, 14, 15);
  g.fillRect(x + 7, y - 87, 13, 5);

  // Combined prison toilet below.
  g.fillStyle(0x858e8d, 1);
  g.fillRoundedRect(x, y - 29, 55, 59, 13);
  g.fillStyle(0x434b4a, 1);
  g.fillEllipse(x + 27, y - 13, 37, 19);
  g.lineStyle(2, 0xaab1af, 0.55);
  g.strokeEllipse(x + 27, y - 13, 37, 19);
}

function drawShelfAndPhotos(scene) {
  const g = scene.add.graphics();

  // Shelf with toiletries/books.
  g.fillStyle(0x252a27, 1);
  g.fillRect(37, 142, 127, 6);
  g.fillStyle(0x8f7651, 1);
  g.fillRect(48, 121, 11, 21);
  g.fillStyle(0x687a83, 1);
  g.fillRect(62, 126, 10, 16);
  g.fillStyle(0x5f6e5f, 1);
  g.fillRect(76, 118, 12, 24);
  g.fillStyle(0x8c5450, 1);
  g.fillRect(96, 123, 8, 19);

  // Personal photos / postcards: enough warmth without turning the cell into a bedroom.
  g.fillStyle(0xcbbf9d, 1);
  g.fillRect(176, 146, 31, 37);
  g.fillStyle(0x958b75, 1);
  g.fillRect(181, 151, 21, 17);
  g.fillStyle(0xaca38c, 1);
  g.fillRect(215, 155, 23, 29);
  g.fillStyle(0x66716c, 1);
  g.fillRect(219, 159, 15, 12);

  // Pencil marks / calendar tally.
  g.lineStyle(1, 0x7d827c, 0.6);
  for (let i = 0; i < 5; i++) g.lineBetween(184 + i * 4, 210, 184 + i * 4, 227);
  g.lineBetween(182, 225, 203, 211);
}

function drawPrisoner(scene, x, y) {
  const c = scene.add.container(x, y);

  // Ground shadow.
  const shadow = scene.add.ellipse(0, 67, 58, 14, 0x080a09, 0.4);

  // Legs / shoes.
  const leftLeg = scene.add.rectangle(-13, 34, 18, 52, 0x394341).setOrigin(0.5, 0);
  const rightLeg = scene.add.rectangle(13, 34, 18, 52, 0x394341).setOrigin(0.5, 0);
  const leftShoe = scene.add.ellipse(-14, 85, 27, 11, 0x171a19);
  const rightShoe = scene.add.ellipse(14, 85, 27, 11, 0x171a19);

  // Torso – muted blue/grey institutional uniform, less cartoony than bright orange.
  const torso = scene.add.rectangle(0, -3, 55, 78, 0x596865).setOrigin(0.5);
  torso.setStrokeStyle(1, 0x76827e);

  // Shirt collar / undershirt.
  const undershirt = scene.add.triangle(0, -38, -9, 0, 9, 0, 0, 15, 0xc0bcb0);

  // Arms.
  const leftArm = scene.add.rectangle(-36, 4, 15, 65, 0x53625f).setAngle(6);
  const rightArm = scene.add.rectangle(36, 4, 15, 65, 0x53625f).setAngle(-6);
  const leftHand = scene.add.circle(-39, 37, 8, 0xb98c70);
  const rightHand = scene.add.circle(39, 37, 8, 0xb98c70);

  // Neck + head.
  const neck = scene.add.rectangle(0, -51, 17, 18, 0xb98c70);
  const head = scene.add.ellipse(0, -77, 41, 49, 0xc89a79);

  // Ears.
  const earL = scene.add.circle(-21, -76, 5, 0xb9896c);
  const earR = scene.add.circle(21, -76, 5, 0xb9896c);

  // Hair with a slightly irregular silhouette.
  const hair = scene.add.graphics();
  hair.fillStyle(0x2b2926, 1);
  hair.fillEllipse(0, -91, 40, 22);
  hair.fillRect(-19, -92, 7, 17);
  hair.fillRect(12, -92, 7, 15);

  // Facial features.
  const eyeL = scene.add.ellipse(-8, -78, 3.5, 2.5, 0x262626);
  const eyeR = scene.add.ellipse(8, -78, 3.5, 2.5, 0x262626);
  const browL = scene.add.rectangle(-8, -84, 10, 1.5, 0x4a382e).setAngle(-5);
  const browR = scene.add.rectangle(8, -84, 10, 1.5, 0x4a382e).setAngle(5);
  const nose = scene.add.rectangle(0, -72, 2, 7, 0xa9765f);
  const mouth = scene.add.rectangle(0, -64, 12, 1.5, 0x744f45);

  // Inmate ID patch.
  const patch = scene.add.rectangle(14, -17, 20, 11, 0xc6c0aa);
  const patchText = scene.add.text(14, -17, 'B17', {
    fontFamily: 'Arial',
    fontSize: '6px',
    color: '#303431',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  c.add([
    shadow,
    leftLeg,
    rightLeg,
    leftShoe,
    rightShoe,
    leftArm,
    rightArm,
    leftHand,
    rightHand,
    torso,
    undershirt,
    neck,
    earL,
    earR,
    head,
    hair,
    eyeL,
    eyeR,
    browL,
    browR,
    nose,
    mouth,
    patch,
    patchText,
  ]);

  return c;
}

function createButton(scene, x, y, label, sublabel, callback) {
  const bg = scene.add
    .rectangle(x, y, 158, 54, 0x222726)
    .setStrokeStyle(1, 0x3d4541)
    .setInteractive({ useHandCursor: true });

  scene.add.text(x, y - 7, label, {
    fontFamily: 'Arial',
    fontSize: '13px',
    fontStyle: 'bold',
    color: '#f0eee7',
  }).setOrigin(0.5);

  scene.add.text(x, y + 11, sublabel, {
    fontFamily: 'Arial',
    fontSize: '8px',
    color: '#7d8580',
  }).setOrigin(0.5);

  bg.on('pointerover', () => bg.setFillStyle(0x303735));
  bg.on('pointerout', () => bg.setFillStyle(0x222726));
  bg.on('pointerdown', callback);
}

function random(min, max) {
  return Phaser.Math.Between(min, max);
}

function chance(probability) {
  return Math.random() < probability;
}
