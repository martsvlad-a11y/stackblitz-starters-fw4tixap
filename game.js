const W=960,H=540;
const ROOMS=['CELL','YARD','GYM','LIBRARY','MESS','WORK'];
const LABEL={CELL:'CELL',YARD:'YARD',GYM:'GYM',LIBRARY:'LIBRARY',MESS:'MESS HALL',WORK:'WORK'};
const NAME={CELL:'CELL B-17 · NORTH WING',YARD:'RECREATION YARD',GYM:'WEIGHT ROOM',LIBRARY:'PRISON LIBRARY',MESS:'MESS HALL',WORK:'LAUNDRY WORKSHOP'};

new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#101314',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{create}});

function create(){
  const s=this;
  let room='CELL',layer=null,player=null,tween=null;
  const nav={};

  const top=s.add.graphics().setDepth(100);
  top.fillStyle(0x0c0f10,.98).fillRect(0,0,W,92).lineStyle(1,0x2b302e).lineBetween(0,91,W,91);
  s.add.text(28,18,'PRISON 365',{fontFamily:'Arial',fontSize:'14px',color:'#a7ada8',fontStyle:'bold'}).setDepth(101);
  s.add.text(28,42,'DAY 0 / 365',{fontFamily:'Arial',fontSize:'30px',color:'#f1ede1',fontStyle:'bold'}).setDepth(101);
  const roomText=s.add.text(930,35,'',{fontFamily:'Arial',fontSize:'13px',color:'#a2a8a3',fontStyle:'bold'}).setOrigin(1,.5).setDepth(101);
  s.add.text(930,58,'tap the floor to walk',{fontFamily:'Arial',fontSize:'11px',color:'#6f7772'}).setOrigin(1,.5).setDepth(101);

  const bar=s.add.graphics().setDepth(100);
  bar.fillStyle(0x0c0f10,.98).fillRect(0,462,W,78).lineStyle(1,0x2b302e).lineBetween(0,462,W,462);
  const bw=142,gap=8,start=(W-(ROOMS.length*bw+(ROOMS.length-1)*gap))/2;
  ROOMS.forEach((r,i)=>{
    const x=start+i*(bw+gap)+bw/2;
    const b=s.add.rectangle(x,501,bw,48,0x1c211f).setStrokeStyle(1,0x38403c).setInteractive({useHandCursor:true}).setDepth(101);
    s.add.text(x,501,LABEL[r],{fontFamily:'Arial',fontSize:LABEL[r].length>8?'11px':'12px',color:'#d9dbd6',fontStyle:'bold'}).setOrigin(.5).setDepth(102);
    b.on('pointerover',()=>b.setFillStyle(0x303733));
    b.on('pointerout',refreshNav);
    b.on('pointerdown',()=>{if(r!==room) loadRoom(r);});
    nav[r]=b;
  });

  s.input.on('pointerdown',p=>{
    if(!player||p.y<105||p.y>445)return;
    const x=Phaser.Math.Clamp(p.x,60,900),y=Phaser.Math.Clamp(p.y,275,408);
    walk(x,y);
  });

  loadRoom('CELL');

  function refreshNav(){ROOMS.forEach(r=>nav[r].setFillStyle(r===room?0x475149:0x1c211f));}
  function loadRoom(r){
    room=r;
    if(tween)tween.stop();
    if(layer)layer.destroy(true);
    layer=s.add.container(0,0).setDepth(1);
    drawRoom(s,layer,r);
    player=makePrisoner(s,480,365);
    layer.add(player);
    roomText.setText(NAME[r]);
    refreshNav();
  }
  function walk(x,y){
    if(tween)tween.stop();
    const dx=x-player.x;
    if(Math.abs(dx)>4)player.scaleX=dx<0?-1:1;
    const d=Phaser.Math.Distance.Between(player.x,player.y,x,y);
    tween=s.tweens.add({targets:player,x,y,duration:Phaser.Math.Clamp(d*2.8,120,1200),ease:'Linear',onUpdate:()=>animate(player),onComplete:()=>reset(player)});
  }
}

function drawRoom(s,layer,r){
  const g=s.add.graphics();layer.add(g);
  g.fillStyle(0x303532).fillRect(0,92,W,273).fillStyle(0x202421).fillRect(0,365,W,97).lineStyle(1,0x3a403c,.8).lineBetween(0,365,W,365);
  ({CELL:cell,YARD:yard,GYM:gym,LIBRARY:library,MESS:mess,WORK:work}[r])(g);
}

function cell(g){
  g.fillStyle(0x373c39).fillRect(0,92,W,273);
  g.lineStyle(1,0x464c48,.35);for(let y=132;y<360;y+=46)g.lineBetween(0,y,W,y);
  g.fillStyle(0x7f9aa3).fillRect(676,126,156,119).fillStyle(0xd4b169,.14).fillRect(676,126,156,119).lineStyle(8,0x222725).strokeRect(676,126,156,119);
  g.lineStyle(4,0x2a302d);[711,750,789].forEach(x=>g.lineBetween(x,130,x,241));g.lineBetween(680,185,828,185);
  g.fillStyle(0x151817).fillRoundedRect(58,286,255,17,5).fillStyle(0x777c73).fillRoundedRect(65,246,240,42,7).fillStyle(0x58635a).fillRoundedRect(69,254,150,30,5).fillStyle(0xc5c1b5).fillRoundedRect(245,252,51,26,8);
  g.fillStyle(0x171a19).fillRect(74,302,8,58).fillRect(286,302,8,58);
  g.fillStyle(0x545b56).fillRect(360,222,170,12).fillRect(374,234,8,88).fillRect(507,234,8,88).fillStyle(0xb5ad92).fillRect(390,213,54,7).fillStyle(0x876e4c).fillRect(452,209,41,12);
  g.fillStyle(0x8b9492).fillRoundedRect(845,241,78,43,9).fillStyle(0x4a5351).fillEllipse(884,263,45,15).fillStyle(0x899290).fillRoundedRect(855,302,63,60,16).fillStyle(0x434a48).fillEllipse(886,319,42,19);
  g.fillStyle(0x252a27).fillRect(112,151,188,8);[0x8e7652,0x667982,0x66705f,0x8c5650].forEach((c,i)=>g.fillStyle(c).fillRect(129+i*25,124+(i%2)*6,14,28-(i%2)*5));
}
function yard(g){
  g.fillStyle(0x667984).fillRect(0,92,W,150).fillStyle(0x8b8d84).fillRect(0,242,W,123).fillStyle(0x4b514b).fillRect(0,350,W,112);
  g.lineStyle(2,0xd1d3ca,.23);for(let x=0;x<W;x+=40)g.lineBetween(x,94,x,244);for(let y=112;y<242;y+=34)g.lineBetween(0,y,W,y);
  g.lineStyle(5,0x343a37).lineBetween(160,172,160,329).fillStyle(0xd4d2c7).fillRect(120,178,82,48).lineStyle(3,0x9f5f45).strokeCircle(161,236,19);
  g.fillStyle(0x292e2b).fillRect(660,317,175,14).fillRect(680,331,9,34).fillRect(807,331,9,34);
}
function gym(g){
  g.fillStyle(0x313733).fillRect(0,92,W,273).fillStyle(0x1e2220).fillRect(0,337,W,125);
  g.lineStyle(8,0x666d68).lineBetween(112,160,112,354).lineBetween(270,160,270,354).lineBetween(112,168,270,168).lineStyle(5,0x8b938e).lineBetween(126,239,257,239);
  g.fillStyle(0x242826).fillCircle(137,239,24).fillCircle(247,239,24).fillStyle(0x555d58).fillRoundedRect(140,306,105,18,6).fillRect(187,324,8,35);
  g.fillStyle(0x3b413d).fillRect(390,284,240,16).fillRect(405,300,8,50).fillRect(610,300,8,50);[420,465,510,555,600].forEach((x,i)=>g.fillStyle(0x242826).fillCircle(x,270-(i%2)*8,17).fillRect(x-20,266-(i%2)*8,40,8));
  g.lineStyle(4,0x555d58).lineBetween(785,120,785,174).fillStyle(0x6f4038).fillRoundedRect(750,171,70,136,26);
}
function library(g){
  g.fillStyle(0x3a3b34).fillRect(0,92,W,273);
  [45,655].forEach(x0=>{g.fillStyle(0x4a3b2b).fillRect(x0,128,255,212);for(let y=157;y<330;y+=48)g.fillStyle(0x2d261f).fillRect(x0+10,y,235,7);for(let row=0;row<4;row++)for(let i=0;i<9;i++){const colors=[0x7d5b45,0x566a62,0x6d4f4b,0x7a704f];g.fillStyle(colors[(i+row)%4]).fillRect(x0+18+i*24,135+row*48,15,20+((i*5+row*3)%18));}});
  g.fillStyle(0x67523b).fillRoundedRect(350,286,260,24,5).fillRect(375,310,10,56).fillRect(575,310,10,56).fillStyle(0xd4cdb3).fillRect(445,277,55,8).fillStyle(0x8b6c49).fillRect(510,273,44,12);
}
function mess(g){
  g.fillStyle(0x4a4c47).fillRect(0,92,W,273).fillStyle(0x777f7b).fillRect(55,146,850,16).fillStyle(0x3c423f).fillRect(55,162,850,68);
  [135,300,465,630,795].forEach(x=>g.fillStyle(0xb8b8ad).fillRoundedRect(x,175,80,33,9));
  [210,480,750].forEach(x=>{g.fillStyle(0x68706b).fillRoundedRect(x-92,304,184,20,5).fillRect(x-70,324,8,40).fillRect(x+62,324,8,40).fillStyle(0x4c534f).fillRoundedRect(x-110,347,58,10,4).fillRoundedRect(x+52,347,58,10,4);});
}
function work(g){
  g.fillStyle(0x3d413d).fillRect(0,92,W,273);[70,190,310].forEach(x=>{g.fillStyle(0x8b918e).fillRoundedRect(x,152,94,121,8).fillStyle(0x343a37).fillCircle(x+47,218,31).lineStyle(4,0xadb2af).strokeCircle(x+47,218,31);});
  g.fillStyle(0x626963).fillRoundedRect(500,281,300,22,5).fillRect(530,303,9,61).fillRect(758,303,9,61).fillStyle(0xc0b9a8).fillRect(555,267,90,14).fillStyle(0x6b7c78).fillRect(665,261,70,20).lineStyle(5,0x555c58).strokeRect(825,246,95,84).fillStyle(0x777f79).fillRect(833,255,79,63);
}

function makePrisoner(s,x,y){
  const c=s.add.container(x,y).setDepth(20);
  const sh=s.add.ellipse(0,31,52,12,0x080a09,.38),ll=s.add.rectangle(-10,5,15,38,0x35413e).setOrigin(.5,0),rl=s.add.rectangle(10,5,15,38,0x35413e).setOrigin(.5,0),ls=s.add.ellipse(-11,44,25,10,0x171a19),rs=s.add.ellipse(11,44,25,10,0x171a19),torso=s.add.rectangle(0,-20,42,56,0x65736c),la=s.add.rectangle(-27,-17,12,48,0x65736c).setOrigin(.5,.15),ra=s.add.rectangle(27,-17,12,48,0x65736c).setOrigin(.5,.15),neck=s.add.rectangle(0,-50,14,12,0xb28e70),head=s.add.circle(0,-68,21,0xb99373),hair=s.add.ellipse(0,-82,39,17,0x2b2926),ear=s.add.circle(20,-67,4,0xa98267),eye=s.add.circle(7,-68,1.7,0x1b1a18),brow=s.add.rectangle(7,-73,9,2,0x3a302a).setRotation(-.08),nose=s.add.rectangle(11,-63,6,2,0x8d6b55),patch=s.add.rectangle(9,-24,21,10,0x2c3431),txt=s.add.text(9,-24,'B17',{fontFamily:'Arial',fontSize:'7px',color:'#d6d8d2',fontStyle:'bold'}).setOrigin(.5);
  c.add([sh,ll,rl,ls,rs,torso,la,ra,neck,head,hair,ear,eye,brow,nose,patch,txt]);c.parts={ll,rl,la,ra};return c;
}
function animate(p){const a=Math.sin(performance.now()/95)*.23;p.parts.ll.rotation=a;p.parts.rl.rotation=-a;p.parts.la.rotation=-a*.8;p.parts.ra.rotation=a*.8;}
function reset(p){p.parts.ll.rotation=p.parts.rl.rotation=p.parts.la.rotation=p.parts.ra.rotation=0;}