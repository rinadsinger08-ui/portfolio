//GAME SETUP
// Create the sprites
// set velocity for the obstacle and the target
var angryBird = createSprite(200, 325);
angryBird.setAnimation("player");
angryBird.velocityY = 5;
var pig = createSprite(50, 325);
pig.setAnimation("pig");
pig.scale = 0.3;
pig.velocityX = -5;
var chicken = createSprite(100, 100);
chicken.setAnimation("chicken");
chicken.scale = 0.2;
chicken.velocityX = -5;


//create the variables
var score = 0;
var health = 100;

function draw() {
  // BACKGROUND
  // draw the ground and other background
  background("yellow");


  // SPRITE INTERACTIONS
  // if the player touches the obstacle
  // the health goes down, and the obstacle turns
  if (angryBird.isTouching(pig)) {
    health = health - 1;
    pig.rotation = randomNumber(1, 10);
  } else {
    pig.rotation = 0;
  }

  // if the player touches the target
  // the score goes up, the target resets
  if (angryBird.isTouching(chicken)) {
    score = score + 1;
    chicken.x = 500;
    chicken.y = randomNumber(50, 350);
  }


  // JUMPING
  // if the player has reached the ground
  // stop moving down
  if (angryBird.y > 325) {
    angryBird.y = 325;
  }

  // if the player presses the up arrow
  // start moving up
  if (keyDown("up")) {
    angryBird.velocityY = -5;
  }

  // if the player reaches the top of the jump
  // start moving down
  if (angryBird.y < 150) {
    angryBird.velocityY = 5;
  }


  // LOOPING
  // if the obstacle has gone off the left hand side of the screen, 
  // move it to the right hand side of the screen
  if (pig.x < -50) {
    pig.x = 430;
  }

  // if the target has gone off the left hand side of the screen,
  // move it to the right hand side of the screen
  if (chicken.x < -50) {
    chicken.y = randomNumber(50, 350);
    chicken.x = 430;
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
  if (health < 0) {
    background("black");
    fill("green");
    textSize(50);
    text("Game Over!" , 40, 200);
  }
}