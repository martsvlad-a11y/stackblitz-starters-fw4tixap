const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#101314',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: { create },
};

new Phaser.Game(config);

const ROOMS = [
  { key: 'CELL', label: 'CELL' },
  { key: 'YARD', label: 'YARD' },
  { key: 'GYM', label: 'GYM' },
  { key: 'LIBRARY', label: 'LIBRARY' },
  { key: 'MESS', label: 'MESS HALL' },
  { key: 'WORK', label: 'WORK' },
];

function create() {
  const scene = this;
  let currentRoom = 'CELL';
  let roomLayer;
  let player;
  let moveTween;

  const uiLayer = scene.add.container(0, 0).setDepth(100);

  const title = scene.add.text(28, 19, 'PRISON 365', {
    fontFamily: 'Arial', fontSize: '15px', color: '#a8aea9', fontStyle: 'bold'
  });
  uiLayer.add(title);

  const dayText = scene.add.text(28, 44, 'DAY 0 / 365', {
    fontFamily: 'Arial', fontSize: '30px', color: '#f3efe3', fontStyle: 'bold'
  });
  uiLayer.add(dayText);

  const roomText = scene.add.text(930, 31, '', {
    fontFamily: 'Arial', fontSize: '13px', color: '#9ca29e', fontStyle: 'bold'
  }).setOrigin(1, 0.5);
  uiLayer.add(roomText);

  const hint = scene.add.text(480, 452, 'TAP THE FLOOR TO WALK', {
    fontFamily: 'Arial', fontSize: '11px', color: '#777f7a', fontStyle: 'bold'
  }).setOrigin(0.5);
  uiLayer.add(hint);

  buildNav();
  loadRoom('CELL');

  scene.input.on('pointerdown', (pointer) => {
    if (pointer.y >= 442) return;
    if (!player) return;

    const targetX = Phaser.Math.Clamp(pointer.x, 72, 888);
    const targetY = Phaser.Math.Clamp(pointer.y, 260, 408);
    walkTo(targetX, targetY);
  });

  function buildNav() {
    const bar = scene.add.graphics();
    bar.fillStyle(0x0d1011, 0.98);
    bar.fillRect(0, 466, 960, 74);
    bar.lineStyle(1, 0x2c3230, 1);
    bar.lineBetween(0, 466, 960, 466);
    uiLayer.add(bar);

    const gap = 8;
    const width = 142;
    const total = ROOMS.length * width + (ROOMS.length - 1) * gap;
    const startX = (960 - total) / 2;

    ROOMS.forEach((room, i) => {
      const x = startX + i * (width + gap) + width / 2;
      const button = scene.add.rectangle(x, 503, width, 46, 0x1d2220)
        .setStrokeStyle(1, 0x39413d)
        .setInteractive({ useHandCursor: true });

      const label = scene.add.text(x, 503, room.label, {
        fontFamily: 'Arial', fontSize: room.key === 'LIBRARY' || room.key === 'MESS' ? '11px' : '12px',
        color: '#d8dbd5', fontStyle: 'bold'
      }).setOrigin(0.5);

      button.on('pointerover', () => button.setFillStyle(0x303733));
      button.on('pointerout', () => button.setFillStyle(room.key === currentRoom ? 0x465149 : 0x1d2220));
      button.on('pointerdown', (pointer, localX, localY, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        if (room.key !== currentRoom) loadRoom(room.key);
      });

      button.roomKey = room.key;
      uiLayer.add([button, label]);
    });
  }

  function refreshNav() {
    uiLayer.list.forEach((obj) => {
      if (obj.roomKey) {
        obj.setFillStyle(obj.roomKey === currentRoom ? 0x465149 : 0x1d2220);
      }
    });
  }

  function loadRoom(key) {
    currentRoom = key;
    if (moveTween) moveTween.stop();
    if (roomLayer) roomLayer.destroy(true);

    roomLayer = scene.add.container(0, 0).setDepth(1);
    drawRoom(scene, roomLayer, key);

    player = drawPrisoner(scene, 480, 365);
    roomLayer.add(player);

    roomText.setText(roomName(key));
    refreshNav();

    scene.cameras.main.fadeIn(180, 10, 12, 12);
  }

  function walkTo(x, y) {
    if (moveTween) moveTween.stop();

    const dx = x - player.x;
    const distance = Phaser.Math.Distance.Between(player.x, player.y, x, y);
    const duration = Phaser.Math.Clamp(distance * 3.1, 120, 1300);

    if (Math.abs(dx) > 4) player.setScale(dx < 0 ? -1 : 1, 1);

    player.walking = true;
    moveTween = scene.tweens.add({
      targets: player,
      x,
      y,
      duration,
      ease: 'Linear',
      onUpdate: () => animateWalk(player),
      onComplete: () => {
        player.walking = false;
        player.bodyParts.leftLeg.rotation = 0;
        player.bodyParts.rightLeg.rotation = 0;
        player.bodyParts.leftArm.rotation = 0;
        player.bodyParts.rightArm.rotation = 0;
      },
    });
  }
}

function roomName(key) {
  return {
    CELL: 'CELL B-17  •  NORTH WING',
    YARD: 'RECREATION YARD',
    GYM: 'WEIGHT ROOM',
    LIBRARY: 'PRISON LIBRARY',
    MESS: 'MESS HALL',
    WORK: 'LAUNDRY WORKSHOP',
  }[key];
}

function drawRoom(scene, layer, key) {
  const g = scene.add.graphics();
  layer.add(g);

  g.fillStyle(0x222725, 1);
  g.fillRect(0, 95, 960, 347);
  g.fillStyle(0x171b19, 1);
  g.fillRect(0, 365, 960, 77);
  g.lineStyle(1, 0x303632, 0.8);
  g.lineBetween(0, 365, 960, 365);

  if (key === 'CELL') drawCell(scene, layer, g);
  if (key === 'YARD') drawYard(scene, layer, g);
  if (key === 'GYM') drawGym(scene, layer, g);
  if (key === 'LIBRARY') drawLibrary(scene, layer, g);
  if (key === 'MESS') drawMess(scene, layer, g);
  if (key === 'WORK') drawWork(scene, layer, g);
}

function drawCell(scene, layer, g) {
  g.fillStyle(0x343a37, 1); g.fillRect(0, 95, 960, 270);
  for (let y = 130; y < 360; y += 45) { g.lineStyle(1, 0x454b47, 0.35); g.lineBetween(0, y, 960, y); }

  // Window
  g.fillStyle(0x77909a, 1); g.fillRect(665, 130, 165, 125);
  g.fillStyle(0xd8b267, 0.12); g.fillRect(665, 130, 165, 125);
  g.lineStyle(8, 0x222726, 1); g.strokeRect(665, 130, 165, 125);
  g.lineStyle(4, 0x2a302e, 1);
  [700, 740, 780].forEach(x => g.lineBetween(x, 132, x, 252));
  g.lineBetween(668, 193, 827, 193);

  // Bed
  g.fillStyle(0x151817, 1); g.fillRoundedRect(60, 274, 250, 18, 5);
  g.fillStyle(0x747970, 1); g.fillRoundedRect(66, 240, 238, 40, 7);
  g.fillStyle(0x58635a, 1); g.fillRoundedRect(69, 249, 150, 28, 6);
  g.fillStyle(0xc3c0b4, 1); g.fillRoundedRect(244, 246, 52, 25, 8);
  g.fillStyle(0x181b1a, 1); g.fillRect(75, 292, 8, 62); g.fillRect(286, 292, 8, 62);

  // Desk
  g.fillStyle(0x555b56, 1); g.fillRect(350, 225, 170, 12);
  g.fillRect(365, 237, 8, 83); g.fillRect(497, 237, 8, 83);
  g.fillStyle(0xb0a98d, 1); g.fillRect(385, 216, 55, 7);
  g.fillStyle(0x8f7450, 1); g.fillRect(446, 211, 42, 12);
  g.fillStyle(0x3f4642, 1); g.fillRoundedRect(404, 322, 68, 12, 4); g.fillRect(434, 334, 8, 30);

  // Sink + toilet
  g.fillStyle(0x8a9391, 1); g.fillRoundedRect(844, 246, 80, 44, 9);
  g.fillStyle(0x4b5452, 1); g.fillEllipse(884, 268, 46, 16);
  g.fillStyle(0x8b9492, 1); g.fillRoundedRect(854, 305, 64, 59, 16);
  g.fillStyle(0x424947, 1); g.fillEllipse(886, 321, 43, 20);

  // Personal details
  g.fillStyle(0xcbbf9d, 1); g.fillRect(563, 163, 34, 43);
  g.fillStyle(0x8e8774, 1); g.fillRect(569, 170, 22, 19);
  g.fillStyle(0x252a27, 1); g.fillRect(110, 155, 190, 8);
  [126, 148, 171, 199].forEach((x, i) => { g.fillStyle([0x8e7652,0x667982,0x66705f,0x8c5650][i],1); g.fillRect(x, 126 + i%2*7, 14, 29 - i%2*7); });
}

function drawYard(scene, layer, g) {
  g.fillStyle(0x667781, 1); g.fillRect(0, 95, 960, 145);
  g.fillStyle(0x8c8d82, 1); g.fillRect(0, 240, 960, 125);
  g.lineStyle(2, 0xc6c9bf, 0.28);
  for (let x = 0; x < 960; x += 38) g.lineBetween(x, 97, x, 242);
  for (let y = 115; y < 240; y += 34) g.lineBetween(0, y, 960, y);
  g.fillStyle(0x4a5049, 1); g.fillRect(0, 350, 960, 92);

  // Basketball hoop and court
  g.lineStyle(5, 0x333936, 1); g.lineBetween(160, 173, 160, 326);
  g.fillStyle(0xd4d2c7, 1); g.fillRect(120, 180, 82, 49);
  g.lineStyle(3, 0x9f5f45, 1); g.strokeCircle(161, 237, 19);
  g.lineStyle(2, 0xd2d5cd, 0.45); g.strokeCircle(230, 353, 63); g.lineBetween(230, 290, 230, 415);

  // Benches / fence shadows
  g.fillStyle(0x292e2b, 1); g.fillRect(650, 316, 180, 14); g.fillRect(670, 330, 9, 38); g.fillRect(802, 330, 9, 38);
  g.fillStyle(0x9c6b3f, 1); g.fillCircle(435, 346, 12);
}

function drawGym(scene, layer, g) {
  g.fillStyle(0x303632, 1); g.fillRect(0, 95, 960, 270);
  g.fillStyle(0x1e2220, 1); g.fillRect(0, 335, 960, 107);
  g.lineStyle(1, 0x383e3a, 0.5);
  for (let x = 0; x < 960; x += 48) g.lineBetween(x, 335, x, 442);

  // Rack
  g.lineStyle(8, 0x666d68, 1); g.lineBetween(112, 166, 112, 353); g.lineBetween(270, 166, 270, 353); g.lineBetween(112, 174, 270, 174);
  g.lineStyle(5, 0x8b938e, 1); g.lineBetween(126, 240, 257, 240);
  g.fillStyle(0x242826, 1); g.fillCircle(137, 240, 24); g.fillCircle(247, 240, 24);
  g.fillStyle(0x555d58, 1); g.fillRoundedRect(140, 305, 105, 18, 6); g.fillRect(187, 323, 8, 36);

  // Dumbbell rack
  g.fillStyle(0x3b413d, 1); g.fillRect(390, 282, 240, 16); g.fillRect(405, 298, 8, 52); g.fillRect(610, 298, 8, 52);
  [420,465,510,555,600].forEach((x, i) => { g.fillStyle(0x242826,1); g.fillCircle(x, 268 - (i%2)*8, 17); g.fillRect(x-20, 264-(i%2)*8, 40, 8); });

  // Punching bag
  g.lineStyle(4, 0x555d58, 1); g.lineBetween(785, 120, 785, 175);
  g.fillStyle(0x6f4038, 1); g.fillRoundedRect(750, 172, 70, 135, 26);
}

function drawLibrary(scene, layer, g) {
  g.fillStyle(0x3a3b34, 1); g.fillRect(0, 95, 960, 270);
  const shelves = [45, 655];
  shelves.forEach(x0 => {
    g.fillStyle(0x4a3b2b, 1); g.fillRect(x0, 132, 255, 208);
    for (let y = 160; y < 330; y += 48) { g.fillStyle(0x2d261f, 1); g.fillRect(x0+10, y, 235, 7); }
    for (let y = 136; y < 322; y += 48) {
      for (let x = x0+17; x < x0+238; x += 23) {
        g.fillStyle([0x7d5b45,0x566a62,0x6d4f4b,0x7a704f][((x+y)/23)|0)%4],1);
        g.fillRect(x, y+5, 15, 20 + ((x+y)%18));
      }
    }
  });

  // Reading table
  g.fillStyle(0x67523b, 1); g.fillRoundedRect(350, 285, 260, 24, 5);
  g.fillRect(375, 309, 10, 60); g.fillRect(575, 309, 10, 60);
  g.fillStyle(0xd6ceb3, 1); g.fillRect(445, 276, 55, 8);
  g.fillStyle(0x8c6d4a, 1); g.fillRect(510, 272, 44, 12);

  // Warm lamps
  [390,570].forEach(x => { g.fillStyle(0xd0b06c,0.85); g.fillCircle(x,238,14); g.fillStyle(0xd8b66e,0.10); g.fillCircle(x,255,65); });
}

function drawMess(scene, layer, g) {
  g.fillStyle(0x4a4c47, 1); g.fillRect(0, 95, 960, 270);
  g.fillStyle(0x222624, 1); g.fillRect(0, 350, 960, 92);

  // Serving counter
  g.fillStyle(0x777f7b, 1); g.fillRect(55, 150, 850, 16);
  g.fillStyle(0x3c423f, 1); g.fillRect(55, 166, 850, 67);
  [135,300,465,630,795].forEach(x => { g.fillStyle(0xb8b8ad,1); g.fillRoundedRect(x, 178, 80, 33, 9); });

  // Tables
  [210,480,750].forEach(x => {
    g.fillStyle(0x68706b, 1); g.fillRoundedRect(x-92, 304, 184, 20, 5);
    g.fillRect(x-70, 324, 8, 43); g.fillRect(x+62, 324, 8, 43);
    g.fillStyle(0x4c534f,1); g.fillRoundedRect(x-110, 346, 58, 10, 4); g.fillRoundedRect(x+52, 346, 58, 10, 4);
  });
}

function drawWork(scene, layer, g) {
  g.fillStyle(0x3d413d, 1); g.fillRect(0, 95, 960, 270);
  g.fillStyle(0x252927, 1); g.fillRect(0, 350, 960, 92);

  // Laundry machines
  [70,190,310].forEach(x => {
    g.fillStyle(0x8b918e, 1); g.fillRoundedRect(x, 155, 94, 120, 8);
    g.fillStyle(0x343a37, 1); g.fillCircle(x+47, 220, 31);
    g.lineStyle(4, 0xadb2af, 1); g.strokeCircle(x+47, 220, 31);
    g.fillStyle(0x343a37,1); g.fillCircle(x+22,174,5); g.fillCircle(x+39,174,5);
  });

  // Folding tables
  g.fillStyle(0x626963, 1); g.fillRoundedRect(500, 280, 300, 22, 5);
  g.fillRect(530, 302, 9, 64); g.fillRect(758, 302, 9, 64);
  g.fillStyle(0xc0b9a8,1); g.fillRect(555,266,90,14); g.fillStyle(0x6b7c78,1); g.fillRect(665,260,70,20);

  // Laundry cart
  g.lineStyle(5, 0x555c58,1); g.strokeRect(825,245,95,85); g.fillStyle(0x777f79,1); g.fillRect(833,254,79,64);
  g.fillStyle(0x151817,1); g.fillCircle(842,339,9); g.fillCircle(903,339,9);
}

function drawPrisoner(scene, x, y) {
  const c = scene.add.container(x, y);
  c.setDepth(20);

  const shadow = scene.add.ellipse(0, 30, 52, 12, 0x080a09, 0.38);
  const leftLeg = scene.add.rectangle(-10, 5, 15, 38, 0x35413e).setOrigin(0.5, 0);
  const rightLeg = scene.add.rectangle(10, 5, 15, 38, 0x35413e).setOrigin(0.5, 0);
  const leftShoe = scene.add.ellipse(-11, 44, 25, 10, 0x171a19);
  const rightShoe = scene.add.ellipse(11, 44, 25, 10, 0x171a19);
  const torso = scene.add.rectangle(0, -20, 42, 56, 0x65736c).setOrigin(0.5);
  const leftArm = scene.add.rectangle(-27, -17, 12, 48, 0x65736c).setOrigin(0.5, 0.15);
  const rightArm = scene.add.rectangle(27, -17, 12, 48, 0x65736c).setOrigin(0.5, 0.15);
  const neck = scene.add.rectangle(0, -50, 14, 12, 0xb28e70);
  const head = scene.add.circle(0, -68, 21, 0xb99373);
  const hair = scene.add.ellipse(0, -82, 39, 17, 0x2b2926);
  const ear = scene.add.circle(20, -67, 4, 0xa98267);
  const eye = scene.add.circle(7, -68, 1.7, 0x1b1a18);
  const brow = scene.add.rectangle(7, -73, 9, 2, 0x3a302a).setRotation(-0.08);
  const nose = scene.add.rectangle(11, -63, 6, 2, 0x8d6b55);
  const idPatch = scene.add.rectangle(9, -24, 21, 10, 0x2c3431);
  const idText = scene.add.text(9, -24, 'B17', { fontFamily:'Arial', fontSize:'7px', color:'#d6d8d2', fontStyle:'bold' }).setOrigin(0.5);

  c.add([shadow,leftLeg,rightLeg,leftShoe,rightShoe,torso,leftArm,rightArm,neck,head,hair,ear,eye,brow,nose,idPatch,idText]);
  c.bodyParts = { leftLeg, rightLeg, leftArm, rightArm };
  return c;
}

function animateWalk(player) {
  const phase = performance.now() / 95;
  const swing = Math.sin(phase) * 0.24;
  player.bodyParts.leftLeg.rotation = swing;
  player.bodyParts.rightLeg.rotation = -swing;
  player.bodyParts.leftArm.rotation = -swing * 0.8;
  player.bodyParts.rightArm.rotation = swing * 0.8;
}
