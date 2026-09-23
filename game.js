const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 390,
  height: 844,
  backgroundColor: '#0d0f10',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: { create, update },
};

new Phaser.Game(config);

let prisoner;
let target = { x: 195, y: 520 };
let currentRoom = 'CELL';
let roomObjects = [];
let locationText;
let hintText;
let targetMarker;
let moving = false;
let walkPhase = 0;

const rooms = ['CELL', 'YARD', 'GYM', 'LIBRARY', 'CAFETERIA', 'WORK'];

function create() {
  const scene = this;

  drawShell(scene);
  prisoner = drawPrisoner(scene, 195, 520);
  prisoner.setDepth(50);

  locationText = scene.add.text(20, 52, '', {
    fontFamily: 'Arial',
    fontSize: '26px',
    color: '#f0eee6',
    fontStyle: 'bold',
  }).setDepth(100);

  hintText = scene.add.text(20, 86, 'Tap anywhere on the floor to move.', {
    fontFamily: 'Arial',
    fontSize: '11px',
    color: '#8c938e',
  }).setDepth(100);

  drawNavigation(scene);
  renderRoom(scene, 'CELL');

  scene.input.on('pointerdown', (pointer) => {
    // Bottom navigation is UI, not walkable space.
    if (pointer.y >= 610 || pointer.y <= 115) return;

    target.x = Phaser.Math.Clamp(pointer.x, 42, 348);
    target.y = Phaser.Math.Clamp(pointer.y, 270, 575);
    moving = true;

    if (targetMarker) targetMarker.destroy();
    targetMarker = scene.add.circle(target.x, target.y, 9, 0xd8c791, 0.18)
      .setStrokeStyle(1, 0xd8c791, 0.45)
      .setDepth(8);

    scene.tweens.add({
      targets: targetMarker,
      alpha: 0,
      scale: 1.9,
      duration: 500,
      onComplete: () => {
        if (targetMarker) {
          targetMarker.destroy();
          targetMarker = null;
        }
      },
    });
  });
}

function update(time, delta) {
  if (!prisoner || !moving) return;

  const dx = target.x - prisoner.x;
  const dy = target.y - prisoner.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 4) {
    prisoner.x = target.x;
    prisoner.y = target.y;
    moving = false;
    prisoner.rotation = 0;
    return;
  }

  const speed = 122;
  const step = Math.min((speed * delta) / 1000, distance);
  prisoner.x += (dx / distance) * step;
  prisoner.y += (dy / distance) * step;

  if (Math.abs(dx) > 3) prisoner.scaleX = dx < 0 ? -1 : 1;

  walkPhase += delta * 0.018;
  prisoner.rotation = Math.sin(walkPhase) * 0.012;
}

function drawShell(scene) {
  const g = scene.add.graphics().setDepth(90);
  g.fillStyle(0x0c0e0f, 1);
  g.fillRect(0, 0, 390, 118);
  g.fillStyle(0x101314, 1);
  g.fillRect(0, 610, 390, 234);
  g.lineStyle(1, 0x292e2d, 1);
  g.lineBetween(0, 117, 390, 117);
  g.lineBetween(0, 610, 390, 610);

  scene.add.text(20, 20, 'PRISON 365', {
    fontFamily: 'Arial',
    fontSize: '12px',
    color: '#9ba19d',
    fontStyle: 'bold',
    letterSpacing: 2,
  }).setDepth(100);

  scene.add.text(370, 21, 'DAY 0 / 365', {
    fontFamily: 'Arial',
    fontSize: '10px',
    color: '#6f7672',
  }).setOrigin(1, 0).setDepth(100);
}

function drawNavigation(scene) {
  scene.add.text(20, 628, 'MOVE THROUGH THE PRISON', {
    fontFamily: 'Arial',
    fontSize: '9px',
    color: '#676e69',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  }).setDepth(100);

  const positions = [
    [70, 681], [195, 681], [320, 681],
    [70, 758], [195, 758], [320, 758],
  ];

  rooms.forEach((room, i) => {
    const [x, y] = positions[i];
    const bg = scene.add.rectangle(x, y, 110, 56, 0x1a1e1d)
      .setStrokeStyle(1, 0x353b38)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    const icon = roomIcon(room);
    scene.add.text(x, y - 8, icon, {
      fontFamily: 'Arial',
      fontSize: '17px',
      color: '#d3d0c5',
    }).setOrigin(0.5).setDepth(101);

    scene.add.text(x, y + 13, room, {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#aeb4af',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    bg.on('pointerover', () => bg.setFillStyle(0x262b29));
    bg.on('pointerout', () => bg.setFillStyle(currentRoom === room ? 0x2b302d : 0x1a1e1d));
    bg.on('pointerdown', () => {
      currentRoom = room;
      renderRoom(scene, room);
      rooms.forEach(() => {});
    });

    bg.roomName = room;
    roomObjects.push({ permanentNav: true, object: bg });
  });
}

function roomIcon(room) {
  return {
    CELL: '▣',
    YARD: '☁',
    GYM: '◆',
    LIBRARY: '▤',
    CAFETERIA: '●',
    WORK: '⚙',
  }[room];
}

function clearRoom() {
  roomObjects
    .filter((item) => !item.permanentNav)
    .forEach((item) => item.object.destroy());
  roomObjects = roomObjects.filter((item) => item.permanentNav);
}

function addRoomObject(object) {
  roomObjects.push({ permanentNav: false, object });
  return object;
}

function renderRoom(scene, room) {
  clearRoom();
  moving = false;

  const spawns = {
    CELL: [205, 505],
    YARD: [195, 520],
    GYM: [195, 520],
    LIBRARY: [195, 520],
    CAFETERIA: [195, 530],
    WORK: [195, 530],
  };

  prisoner.setPosition(...spawns[room]);
  target = { x: prisoner.x, y: prisoner.y };

  const subtitles = {
    CELL: 'CELL B-17  •  NORTH WING',
    YARD: 'RECREATION YARD  •  BLOCK B',
    GYM: 'WEIGHT ROOM  •  WEST WING',
    LIBRARY: 'LIBRARY  •  EDUCATION UNIT',
    CAFETERIA: 'MESS HALL  •  GROUND FLOOR',
    WORK: 'LAUNDRY  •  INDUSTRIAL UNIT',
  };

  locationText.setText(room === 'CAFETERIA' ? 'MESS HALL' : room);
  hintText.setText(subtitles[room] + '   ·   tap floor to walk');

  if (room === 'CELL') drawCell(scene);
  if (room === 'YARD') drawYard(scene);
  if (room === 'GYM') drawGym(scene);
  if (room === 'LIBRARY') drawLibrary(scene);
  if (room === 'CAFETERIA') drawCafeteria(scene);
  if (room === 'WORK') drawWork(scene);
}

function roomGraphics(scene) {
  return addRoomObject(scene.add.graphics().setDepth(1));
}

function roomText(scene, x, y, text, style = {}) {
  return addRoomObject(scene.add.text(x, y, text, {
    fontFamily: 'Arial',
    fontSize: '10px',
    color: '#8f9691',
    ...style,
  }).setDepth(4));
}

function drawBaseRoom(scene, wall, floor) {
  const g = roomGraphics(scene);
  g.fillStyle(wall, 1);
  g.fillRect(0, 118, 390, 492);
  g.fillStyle(floor, 1);
  g.fillPoints([
    new Phaser.Geom.Point(0, 390),
    new Phaser.Geom.Point(390, 390),
    new Phaser.Geom.Point(390, 610),
    new Phaser.Geom.Point(0, 610),
  ], true);
  g.lineStyle(1, 0xffffff, 0.035);
  g.lineBetween(0, 390, 390, 390);
}

function drawCell(scene) {
  drawBaseRoom(scene, 0x343936, 0x222624);
  const g = roomGraphics(scene);

  // Concrete block wall.
  g.lineStyle(1, 0x464c48, 0.28);
  for (let y = 146; y < 390; y += 42) g.lineBetween(0, y, 390, y);
  for (let x = 65; x < 390; x += 82) g.lineBetween(x, 118, x, 390);

  // Window and bars.
  g.fillStyle(0x76909a, 1);
  g.fillRect(255, 151, 86, 91);
  g.fillStyle(0xd2b36d, 0.12);
  g.fillRect(255, 151, 86, 91);
  g.lineStyle(4, 0x242928, 1);
  g.strokeRect(247, 143, 102, 107);
  [268, 291, 314, 337].forEach((x) => g.lineBetween(x, 151, x, 242));

  // Bed.
  g.fillStyle(0x171b1a, 1);
  g.fillRect(22, 332, 170, 12);
  g.fillRect(28, 344, 6, 90);
  g.fillRect(179, 344, 6, 90);
  g.fillStyle(0x777b70, 1);
  g.fillRoundedRect(25, 300, 164, 42, 5);
  g.fillStyle(0x596358, 1);
  g.fillRoundedRect(30, 307, 105, 31, 4);
  g.fillStyle(0xbab8ae, 1);
  g.fillRoundedRect(142, 307, 40, 25, 7);

  // Desk / stool.
  g.fillStyle(0x484d48, 1);
  g.fillRect(25, 212, 116, 10);
  g.fillRect(35, 222, 5, 63);
  g.fillRect(128, 222, 5, 63);
  g.fillStyle(0x302f28, 1);
  g.fillRect(40, 201, 38, 8);
  g.fillStyle(0xbcb5a2, 1);
  g.fillRect(83, 204, 31, 5);

  // Sink / toilet.
  g.fillStyle(0x838c8a, 1);
  g.fillRoundedRect(310, 292, 56, 35, 7);
  g.fillStyle(0x4b5553, 1);
  g.fillEllipse(338, 309, 34, 12);
  g.fillStyle(0x858e8d, 1);
  g.fillRoundedRect(315, 342, 48, 57, 12);
  g.fillStyle(0x454d4c, 1);
  g.fillEllipse(339, 358, 31, 16);

  // Photos and shelf for cozy contrast.
  g.fillStyle(0x252a27, 1);
  g.fillRect(35, 167, 110, 5);
  g.fillStyle(0x8d7650, 1);
  g.fillRect(47, 149, 10, 18);
  g.fillStyle(0x697b83, 1);
  g.fillRect(63, 153, 10, 14);
  g.fillStyle(0xc9bc99, 1);
  g.fillRect(177, 170, 29, 35);
  g.fillStyle(0x9c927a, 1);
  g.fillRect(215, 177, 24, 29);

  roomText(scene, 28, 445, 'YOUR CELL', { color: '#656c67', fontStyle: 'bold' });
}

function drawYard(scene) {
  drawBaseRoom(scene, 0x88979a, 0x565d57);
  const g = roomGraphics(scene);

  // Sky.
  g.fillStyle(0x849ba5, 1);
  g.fillRect(0, 118, 390, 208);
  g.fillStyle(0xb7c4c5, 0.45);
  g.fillEllipse(74, 181, 114, 26);
  g.fillEllipse(288, 159, 132, 22);

  // Prison walls.
  g.fillStyle(0x747a74, 1);
  g.fillRect(0, 287, 390, 104);
  g.lineStyle(2, 0x666c67, 0.7);
  for (let x = 0; x < 390; x += 55) g.lineBetween(x, 287, x, 390);
  g.lineBetween(0, 337, 390, 337);

  // Fence.
  g.lineStyle(2, 0x343a38, 0.9);
  for (let x = 8; x < 390; x += 18) g.lineBetween(x, 254, x, 351);
  g.lineBetween(0, 260, 390, 260);
  g.lineBetween(0, 347, 390, 347);

  // Basketball hoop.
  g.fillStyle(0x363b38, 1);
  g.fillRect(305, 352, 6, 105);
  g.fillStyle(0xc7c4b8, 1);
  g.fillRect(274, 339, 67, 42);
  g.lineStyle(3, 0x8d5439, 1);
  g.strokeCircle(308, 385, 18);

  // Bench.
  g.fillStyle(0x424945, 1);
  g.fillRect(38, 474, 116, 12);
  g.fillRect(48, 486, 7, 35);
  g.fillRect(136, 486, 7, 35);

  roomText(scene, 26, 566, 'Cold air. Open sky. Everyone watches everyone.', { color: '#c9cfca' });
}

function drawGym(scene) {
  drawBaseRoom(scene, 0x303633, 0x202422);
  const g = roomGraphics(scene);

  // High windows.
  for (let i = 0; i < 4; i++) {
    g.fillStyle(0x667e88, 1);
    g.fillRect(25 + i * 92, 142, 68, 49);
    g.lineStyle(3, 0x242928, 1);
    g.strokeRect(25 + i * 92, 142, 68, 49);
  }

  // Weight rack.
  g.fillStyle(0x3f4541, 1);
  g.fillRect(24, 256, 108, 10);
  g.fillRect(34, 266, 6, 104);
  g.fillRect(116, 266, 6, 104);
  [0, 1, 2].forEach((i) => {
    g.fillStyle(0x181b1a, 1);
    g.fillCircle(53 + i * 28, 298, 16 - i * 2);
    g.fillCircle(53 + i * 28, 338, 13 - i);
  });

  // Bench press.
  g.fillStyle(0x4a514c, 1);
  g.fillRect(195, 407, 118, 14);
  g.fillRect(208, 421, 7, 64);
  g.fillRect(292, 421, 7, 64);
  g.fillStyle(0x1b1e1d, 1);
  g.fillRect(175, 372, 160, 6);
  g.fillCircle(180, 375, 19);
  g.fillCircle(330, 375, 19);

  // Pull-up bars.
  g.lineStyle(6, 0x3e4541, 1);
  g.lineBetween(326, 232, 326, 355);
  g.lineBetween(368, 232, 368, 355);
  g.lineBetween(326, 242, 368, 242);

  roomText(scene, 25, 561, 'WEIGHTS  •  PULL-UP BARS  •  BENCH PRESS', { color: '#6e7670' });
}

function drawLibrary(scene) {
  drawBaseRoom(scene, 0x5a5548, 0x302d27);
  const g = roomGraphics(scene);

  // Warm ceiling lights.
  g.fillStyle(0xe0c986, 0.16);
  g.fillEllipse(195, 235, 360, 190);
  g.fillStyle(0xdbca96, 1);
  g.fillRoundedRect(127, 132, 136, 7, 3);

  // Bookcases.
  [18, 267].forEach((x) => {
    g.fillStyle(0x3d3328, 1);
    g.fillRect(x, 183, 105, 225);
    for (let y = 222; y <= 370; y += 49) g.fillRect(x + 6, y, 93, 6);
    const colors = [0x75534b, 0x596a58, 0x716249, 0x4d6269, 0x846b52];
    for (let row = 0; row < 4; row++) {
      for (let i = 0; i < 7; i++) {
        g.fillStyle(colors[(row + i) % colors.length], 1);
        g.fillRect(x + 10 + i * 12, 194 + row * 49, 9, 25 + ((i + row) % 8));
      }
    }
  });

  // Reading table.
  g.fillStyle(0x574a39, 1);
  g.fillRoundedRect(137, 361, 116, 59, 5);
  g.fillStyle(0x3b3228, 1);
  g.fillRect(149, 420, 7, 70);
  g.fillRect(234, 420, 7, 70);
  g.fillStyle(0xb8aa83, 1);
  g.fillRect(164, 350, 53, 7);

  roomText(scene, 131, 293, 'QUIET AREA', { color: '#b9ae8d', fontSize: '9px' });
}

function drawCafeteria(scene) {
  drawBaseRoom(scene, 0x9a998c, 0x5a5a52);
  const g = roomGraphics(scene);

  // Service hatch.
  g.fillStyle(0x4b504c, 1);
  g.fillRect(38, 161, 314, 93);
  g.fillStyle(0x1c201f, 1);
  g.fillRect(50, 172, 290, 61);
  g.fillStyle(0x9da39e, 1);
  g.fillRect(50, 236, 290, 11);

  // Tables.
  const tables = [[87, 377], [292, 377], [87, 505], [292, 505]];
  tables.forEach(([x, y]) => {
    g.fillStyle(0x777d77, 1);
    g.fillRoundedRect(x - 61, y - 20, 122, 40, 8);
    g.fillStyle(0x444a46, 1);
    g.fillRect(x - 4, y + 20, 8, 48);
    g.fillStyle(0x606661, 1);
    g.fillRoundedRect(x - 82, y - 13, 16, 28, 4);
    g.fillRoundedRect(x + 66, y - 13, 16, 28, 4);
  });

  roomText(scene, 50, 267, 'BREAKFAST 06:30  •  LUNCH 12:00  •  DINNER 17:30', { color: '#5b615d' });
}

function drawWork(scene) {
  drawBaseRoom(scene, 0x555b57, 0x353936);
  const g = roomGraphics(scene);

  // Industrial pipes.
  g.lineStyle(9, 0x3b4140, 1);
  g.lineBetween(22, 154, 365, 154);
  g.lineBetween(342, 154, 342, 258);

  // Washers/dryers.
  [28, 140, 252].forEach((x) => {
    g.fillStyle(0x727b78, 1);
    g.fillRoundedRect(x, 246, 94, 125, 8);
    g.fillStyle(0x1c2120, 1);
    g.fillCircle(x + 47, 309, 32);
    g.lineStyle(5, 0xa0aaa5, 0.65);
    g.strokeCircle(x + 47, 309, 32);
    g.fillStyle(0x242827, 1);
    g.fillRect(x + 14, 259, 66, 13);
  });

  // Folding table and baskets.
  g.fillStyle(0x777d77, 1);
  g.fillRect(73, 448, 246, 13);
  g.fillStyle(0x474c49, 1);
  g.fillRect(89, 461, 8, 85);
  g.fillRect(295, 461, 8, 85);
  g.fillStyle(0x887b64, 1);
  g.fillRoundedRect(21, 490, 70, 46, 7);
  g.fillRoundedRect(302, 490, 68, 46, 7);

  roomText(scene, 21, 561, 'LAUNDRY SHIFT  •  LOW PAY  •  LOW TROUBLE', { color: '#747c77' });
}

function drawPrisoner(scene, x, y) {
  const c = scene.add.container(x, y);

  const shadow = scene.add.ellipse(0, 55, 54, 13, 0x070909, 0.32);
  const leftLeg = scene.add.rectangle(-11, 20, 15, 39, 0x3b4542).setOrigin(0.5, 0);
  const rightLeg = scene.add.rectangle(11, 20, 15, 39, 0x3b4542).setOrigin(0.5, 0);
  const leftShoe = scene.add.ellipse(-12, 62, 23, 9, 0x171918);
  const rightShoe = scene.add.ellipse(12, 62, 23, 9, 0x171918);
  const torso = scene.add.rectangle(0, -12, 45, 60, 0x5b6662).setOrigin(0.5);
  const shirtBand = scene.add.rectangle(0, 4, 45, 4, 0x46504d);
  const leftArm = scene.add.rectangle(-28, -9, 11, 47, 0x59635f).setRotation(0.04);
  const rightArm = scene.add.rectangle(28, -9, 11, 47, 0x59635f).setRotation(-0.04);
  const leftHand = scene.add.circle(-29, 14, 6, 0xb58e70);
  const rightHand = scene.add.circle(29, 14, 6, 0xb58e70);
  const neck = scene.add.rectangle(0, -47, 12, 12, 0xb58e70);
  const head = scene.add.ellipse(0, -67, 34, 42, 0xbf9675);
  const hair = scene.add.arc(0, -75, 17, 190, 350, false, 0x2b2925);
  const leftEye = scene.add.circle(-6, -67, 1.4, 0x2a2926);
  const rightEye = scene.add.circle(6, -67, 1.4, 0x2a2926);
  const nose = scene.add.line(0, -62, 0, 0, 2, 6, 0x8f6e58).setLineWidth(1);
  const id = scene.add.text(0, -14, 'B17', {
    fontFamily: 'Arial',
    fontSize: '7px',
    color: '#d4d6cf',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  c.add([
    shadow, leftLeg, rightLeg, leftShoe, rightShoe, torso, shirtBand,
    leftArm, rightArm, leftHand, rightHand, neck, head, hair,
    leftEye, rightEye, nose, id,
  ]);

  c.setSize(72, 145);
  return c;
}
