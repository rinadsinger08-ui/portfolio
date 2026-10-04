//Name variables
var backdrop = createSprite(200, 200);
backdrop.setAnimation("backdrop");
backdrop.visible = false;

var spider = createSprite(200, 200);
spider.setAnimation("spider");
spider.visible = false;

var ghost = createSprite(200, 350);
ghost.setAnimation("ghost");
ghost.scale = 1;
ghost.visible = false;

var ghost2 = createSprite(380, 350);
ghost2.setAnimation("ghost2");
ghost2.visible = false;

var alienPink = createSprite(200, 200);
alienPink.setAnimation("alienPink");
alienPink.visible = false;

var pumpkin = createSprite(200, 200);
pumpkin.setAnimation("pumpkin");
pumpkin.scale = 0.5;
pumpkin.visible = false;

var lollipop = createSprite(100, 0);
lollipop.setAnimation("lollipop");
lollipop.scale = 0.2;

var chocolate = createSprite(200, 0);
chocolate.setAnimation("chocolate");
chocolate.scale = 0.2;

var bonBon = createSprite(300, 0);
bonBon.setAnimation("bonBon");
bonBon.scale = 0.2;

var lifeSaver = createSprite(350, 0);
lifeSaver.setAnimation("lifeSaver");
lifeSaver.scale = 0.2;

//Name non-sprite variables
var totalCandies = 4;
var clicks = 0;

//Draw loop
function draw() {
  //Card visuals and text
  background("orange");
  fill("DarkOrange");
  noStroke();
  rect(70, 70, 250, 250);
  textSize(30);
  textFont("Cursive");
  fill("yellow");
  text("HAPPY HALLOWEEN!", 30, 200);
  textSize(20);
  stroke("black");
  text("collect ALL candies for a surprise!", 50, 250);
  fill("orange");
  
  //Candies with counter
  lollipop.y = lollipop.y + 4;
  if (mousePressedOver(lollipop) && mouseWentDown("leftButton")) {
      clicks = clicks + 1;
      lollipop.visible = false;
  }
  chocolate.y = chocolate.y + 3;
  if (mousePressedOver(chocolate) && mouseWentDown("leftButton")) {
    clicks = clicks + 1;
    chocolate.visible = false;
  }
  bonBon.y = bonBon.y + 2;
  if (mousePressedOver(bonBon) && mouseWentDown("leftButton")) {
    clicks = clicks + 1;
    bonBon.visible = false;
  }
  lifeSaver.y = lifeSaver.y + 1;
  if (mousePressedOver(lifeSaver) && mouseWentDown("leftButton")) {
    clicks = clicks + 1;
    lifeSaver.visible = false;
  }
  //Sprites with counter
  if (keyDown("left")) {
    ghost.x = ghost.x - 5;
  }
  if (keyDown("right")) {
    ghost.x = ghost.x + 5;
  }
  if (keyDown("up")) {
    ghost.y = ghost.y - 5;
  }
  if (keyDown("down")) {
    ghost.y = ghost.y + 5;
  }
  if (ghost.y < 200) {
    ghost.setAnimation("alienYellow");
  } else {
    ghost.setAnimation("ghost");
  }
  if (World.mouseX < 200) {
    pumpkin.setAnimation("pumpkinEvil");
    pumpkin.x = randomNumber(195, 205);
    pumpkin.y = randomNumber(195, 205);
  } else {
    pumpkin.setAnimation("pumpkin");
  }
  
  //Conditional
  if (clicks >= totalCandies) {
    background("backdrop");
    ghost.visible = true;
    backdrop.visible = true;
    pumpkin.visible = true;
    ghost2.x = ghost2.x - 3;
    alienPink.visible = true;
    alienPink.y = alienPink.y - 3;
    ghost2.visible = true;
    spider.visible = true;
    spider.x = spider.x - 3;
    spider.y = spider.y - 3;
  }

  drawSprites();
  
}