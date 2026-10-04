// Create your variables here
var score = 0;
var health = 100;
// Create your sprites here

//Backgrounds
var background1 = createSprite(200, 250);
background1.setAnimation("basicBackground");
background1.scale = 0.4;
background1.visible = true;
var cuteBackground = createSprite(150, 200);
cuteBackground.setAnimation("cuteBackground");
cuteBackground.scale = 1.1;
cuteBackground.visible = false;

//Player
var player = createSprite(100, 325);
player.setAnimation("girl");
player.scale = 0.07;
player.velocityX = 0;
player.velocityY = 0;

//Targets (clothing)
var dress = createSprite(200, -100);
dress.setAnimation("dress");
dress.scale = 0.4;
dress.velocityY = 6;
var greenOutfit = createSprite(350, -100);
greenOutfit.setAnimation("greenOutfit");
greenOutfit.scale = 0.4;
greenOutfit.velocityY = 2.5;
var closet = createSprite(400, 340);
var overalls = createSprite(50, -100);
overalls.setAnimation("overalls");
overalls.scale = 0.35;
overalls.velocityY = 4;
var redDress = createSprite(50, -100);
redDress.setAnimation("redDress");
redDress.scale = 0.06;
redDress.velocityY = 4;
redDress.visible = false;
var blackDress = createSprite(350, -100);
blackDress.setAnimation("blackDress");
blackDress.scale = 0.2;
blackDress.velocityY = 5.5;
blackDress.visible = false;
var purpleDress = createSprite(200, -100);
purpleDress.setAnimation("purpleDress");
purpleDress.scale = 0.06;
purpleDress.velocityY = 7;
purpleDress.visible = false;

//2 obstacles
closet.setAnimation("closet");
closet.scale = 0.3;
closet.velocityX = -4;
var tomato = createSprite(200, 0);
tomato.setAnimation("tomato");
tomato.scale = 0.1;
tomato.velocityY = 0;
tomato.visible = false;

function draw() {

//update sprites
  //Collison player and obstacle interaction
  if (player.isTouching(closet)) {
    player.bounceOff(closet);
    health = health - 10;
    closet.x = 800;
  }

  //Resetting player and obstacles position 
  if (player.x > 450) {
    player.x = 100;
    player.y = 325;
  }

  if (player.x < -100) {
    player.x = 300;
    player.y = 325;
    player.velocityX = 0;
  }
  
  if (closet.x < 0) {
    closet.x = 400;
    closet.velocityX = randomNumber(-2, -5);
  }

  // JUMPING
  // if the player has reached the ground
  // stop moving down
  if (player.y > 325) {
    player.y = 325;
  }

  // if the player presses the up arrow
  // start moving up
  if (keyDown("up")) {
    player.velocityY = -15;
  }

  // if the player reaches the top of the jump
  // start moving down
  if (player.y < 150) {
    player.velocityY = 5;
  }
  //If player touches clothing
  //Player will wear the clothing and score goes up
  if (player.isTouching(dress)) {
    player.setAnimation("girldress");
    dress.visible = false;
    score = score + 5;
  }
  if (player.isTouching(greenOutfit)) {
    player.setAnimation("girlGreen");
    greenOutfit.visible = false;
    score = score + 5;
  }
  if (player.isTouching(overalls)) {
    player.setAnimation("girlOveralls");
    overalls.visible = false;
    score = score + 5;
  }
  
//If the left key is pressed
//Move the players x axis position 3 right/left or 6 spaces if score is higher than 50
  if (score < 50) {
    if (keyDown("right")) {
      player.x += 3;
    }
    else if (keyDown("left")) {
      player.x -= 3;
    }
    
  } else {
    
    if (keyDown("right")) {
      player.x += 6;
    }
    else if (keyDown("left")) {
      player.x -= 6;
    }

  }

//Looping the targets/clothing
//if they get out of frame or touched by player (become invisible) their y position is reset and x is random
  if (dress.y > 400 || !dress.visible) {
    dress.y = -100;
    dress.x = randomNumber(50, 350);
    dress.visible = true;
  }

  if (greenOutfit.y > 400 || !greenOutfit.visible) {
    greenOutfit.y = -100;
    greenOutfit.x = randomNumber(50, 350);
    greenOutfit.visible = true;
  }

  if (overalls.y > 400 || !overalls.visible) {
    overalls.y = -100;
    overalls.x = randomNumber(50, 350);
    overalls.visible = true;
  }

//Once score is above 50
//Background changes and a new set of clothes are given
  if (score >= 50) {
    background("white");
    background1.visible = false;
    cuteBackground.visible = true;
    overalls.visible = false;
    dress.visible = false;
    greenOutfit.visible = false;
    closet.visible = false;
    closet.velocityX = 0;
    tomato.visible = true;
    tomato.velocityY = 6;
    blackDress.visible = true;
    redDress.visible = true;
    purpleDress.visible = true;
    //User must use keys to avoid obstacle (tomato)
    //If player touches tomato health goes down,displacement occurs, and position is reset
    if (player.isTouching(tomato)) {
      tomato.displace(player);
      tomato.y = -200;
      tomato.x = randomNumber(1, 400);
      health = health - 10;

    }
    //Resetting tomato/obstacles position if out of frame
    if (tomato.y > 400) {
      tomato.y = -200;
      tomato.x = randomNumber(1, 400);
      
    }
    //User must use mouse to press over target and have their player touching it to wear it
    if (mousePressedOver(redDress) && player.isTouching(redDress)) {
      player.setAnimation("girlRed");
      redDress.visible = false;
      score = score + 10;
    }
    if (mousePressedOver(blackDress) && player.isTouching(blackDress)) {
      player.setAnimation("girlBlack");
      blackDress.visible = false;
      score = score + 10;
    }
    if (mousePressedOver(purpleDress) && player.isTouching(purpleDress)) {
      player.setAnimation("girlPurple");
      purpleDress.visible = false;
      score = score + 10;
    }
    //Looping clothing if out of frame or touched
    if (purpleDress.y > 400 || !purpleDress.visible) {
      purpleDress.y = -100;
      purpleDress.x = randomNumber(50, 350);
      purpleDress.visible = true;
    }
    if (redDress.y > 400 || !redDress.visible) {
      redDress.y = -100;
      redDress.x = randomNumber(50, 350);
      redDress.visible = true;
    }
    if (blackDress.y > 400 || !blackDress.visible) {
      blackDress.y = -100;
      blackDress.x = randomNumber(50, 350);
      blackDress.visible = true;
    }
  }
  // DRAW SPRITES
  drawSprites();
  
  // SCOREBOARD
  fill("black");
  textSize(20);
  text("Score:", 50, 30);
  text (score, 110, 30);
  // add scoreboard and health meter
  fill("black");
  textSize(20);
  text("Health:", 280, 30);
  text (health, 350, 30);
  // GAME OVER
  // if health runs out
  // show Game over
if (health <= 0) {
    background("black");
    fill(rgb(255, 0, 0, 0.5));
    textSize(50);
    text("Game Over!", 60, 200);
  }
}
