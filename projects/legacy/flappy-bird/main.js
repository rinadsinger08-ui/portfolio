// GAME SETUP
// create player, target, and obstacles
var player = createSprite(200, 100);
player.setAnimation("fly_bot");
player.scale = 0.8;

var coin = createSprite(345, 360);
coin.setAnimation("coin");
coin.scale = 0.8;

var rock1 = createSprite(-20, 60);
rock1.setAnimation("rock");
rock1.scale = 0.9;

var rock2 = createSprite(315, -20);
rock2.setAnimation("rock");
rock2.scale = 0.9;

rock1.velocityX = 4;
rock2.velocityY = 4;

function draw() {
  background("lightblue");

  // FALLING (balanced gravity)
  player.velocityY = player.velocityY + 0.6;

  // UP MOVEMENT (controlled jump)
  if (keyDown("up")) {
    player.velocityY = player.velocityY - 1.5;
  }

  // PLAYER CONTROLS
  if (keyDown("left")) {
    player.x = player.x - 4;
  }

  if (keyDown("right")) {
    player.x = player.x + 4;
  }

  // SPRITE INTERACTIONS

  // reset coin when touched
  if (player.isTouching(coin)) {
    coin.x = randomNumber(50, 350);
    coin.y = randomNumber(50, 350);
  }

  // obstacles push the player
  if (player.isTouching(rock1)) {
    player.x = player.x - 10;
    player.y = player.y - 10;
  }

  if (player.isTouching(rock2)) {
    player.x = player.x + 10;
    player.y = player.y + 10;
  }

  // DRAW SPRITES
  drawSprites();

  // GAME OVER
  if (player.x < -50 || player.x > 450 || player.y < -50 || player.y > 450) {
    background("black");
    textSize(50);
    fill("green");
    text("Game Over!", 50, 200);
  }
}