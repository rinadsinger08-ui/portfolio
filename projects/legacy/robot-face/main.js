//Variables
var faceColor = rgb(randomNumber(1, 255), randomNumber(1, 255), randomNumber(1, 255));
var mouthColor = rgb(randomNumber(1, 255), randomNumber(1, 255), randomNumber(1, 255));
var backgroundColor = rgb(randomNumber(100, 130), randomNumber(100, 130), randomNumber(100, 130));
var left_eye_size = randomNumber(1, 100);
var mouthPosition = randomNumber(130, 250);
var left_arm_position = randomNumber(100, 250);
var right_arm_position = randomNumber(250, 300);
var orbit1 = randomNumber(190, 230);
var orbit2 = randomNumber(190, 230);
var orbit3 = randomNumber(190, 230);
background(backgroundColor);
//create robot torso
stroke("black");
strokeWeight(3);
rect(130, 300, 150, 70);
//create left arm
noFill();
stroke("black");
strokeWeight(10);
arc(105, 150, 50, 100, 100, left_arm_position);
//create right arm
noFill();
arc(right_arm_position, 250, 100, 100, 100, 50);
//draw robot face
strokeWeight(5);
fill(faceColor);
rect(100, 100, 200, 200);
//create left eye
fill("blue");
ellipse(150, 165, left_eye_size, left_eye_size);
//create right eye
ellipse(250, 165, 50, 50);
//create mouth
fill(mouthColor);
stroke("black");
strokeWeight(10);
rect(mouthPosition, 250, 50, 30);
//draw antenna
strokeWeight(2);
line(200, 100, 180, -4000);
//draw antenna orbits
ellipse(orbit1, 10, 25, 25);
ellipse(orbit2, 20, 30, 30);
ellipse(orbit3, 30, 40);
//draw arcs
noFill();
arc(100, 105, 40, 50, 0, 90);
arc(300, 110, 40, 50, 80, 200);
//create robot leg wheels
fill("black");
ellipse(130, 369, 100, 100);
ellipse(283, 369, 100, 100);
fill("grey");
ellipse(130, 369, 55, 55);
ellipse(283, 369, 55, 55);
fill("grey");
shape(128, 361, randomNumber(80, 128), randomNumber(360, 361), 146, randomNumber(350, 361));
shape(283, 363, randomNumber(234, 283), randomNumber(360, 363), 300, randomNumber(350, 363));