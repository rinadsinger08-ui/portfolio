//Stores user inputs and final prediction
var homeSize;
var time;
var budget;
var recommendationText = "";

// LIST: Stores history of all recommendations made in this session
var recommendationHistory = [];

setProperty("errorText", "hidden", true);

function isValidTime(time) {
  return !(isNaN(time) || time <= 0);
}

// Screen Navigation
onEvent("button1", "click", function() {
  setScreen("screen2");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

onEvent("button5", "click", function() {
  setScreen("screen3");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

onEvent("button6", "click", function() {
  time = getNumber("timeInput");
  // Checks if time is valid and throws an error 
  if (!isValidTime(time)) {
    setText("errorText", "Please enter a valid time!");
    setProperty("errorText", "hidden", false);
    return;
  }
  setScreen("screen4");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

// Collects user inputs (home size, available time, and budget)
//then switches to the results screen and runs the decision function
onEvent("suggestButton", "click", function() {
  homeSize = getText("homeSizeDropdown");
  time = getNumber("timeInput");
  budget = getText("budgetDropdown");
  
  if (!isValidTime(time)) {
    setText("textOutput", "Invalid Time!");
    return;
  }

  setScreen("petRecscreen");
  
  operate(homeSize, time, budget);
});

// Try Again button: resets the error message and goes back to the first input screen
onEvent("tryAgainButton", "click", function() {
  setProperty("errorText", "hidden", true);
  setScreen("screen2");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

// Button on pet rec screen navigates to history screen
onEvent("historyButton", "click", function() {
  showHistory();
  setScreen("historyScreen");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

// Back button on history screen returns to pet rec results
onEvent("backButton", "click", function() {
  setScreen("petRecscreen");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

// Clear history button: empties the recommendationHistory list and updates the display
onEvent("clearButton", "click", function() {
  recommendationHistory = [];
  setText("historyLabel", "No recommendations yet!");
  playSound("assets/category_tap/game_bubble_pop_click.mp3", false);
});

// Reads from recommendationHistory list and displays all past
// recommendations on the history screen, fulfilling the program's purpose
function showHistory() {
  var historyText = "Past Recommendations:\n";
  for (var i = 0; i < recommendationHistory.length; i++) {
    historyText = historyText + (i + 1) + ". " + recommendationHistory[i] + "\n";
  }
  if (recommendationHistory.length == 0) {
    historyText = "No recommendations yet!";
  }
  setText("historyLabel", historyText);
}

//operate() determines the recommended pet based on the user's home size, available time, and budget.
//It updates the screen by displaying the pet name and image that best matches the user's inputs.
function operate(homeSize, time, budget) {

  // Small Home
if (homeSize == "Small") {
    if (time <= 30 && (budget == "Low" || budget == "Medium")) {
      recommendationText = "Fish or Hamster";
      setImageURL("petImg", "assets/fishamster.jpg");
      playSound("assets/category_achievements/bubbly_game_achievement_sound.mp3", false);
    } else if (time <= 30 && budget == "High") {
      recommendationText = "Turtle 🐢";
      setImageURL("petImg", "assets/turts.jpeg");
      playSound("assets/category_jump/ninja_jump_2.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "Medium") {
      recommendationText = "Bird 🦜";
      setImageURL("petImg", "assets/birds.jpg");
      playSound("assets/category_animals/rooster.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "High") {
      recommendationText = "Rabbit";
      setImageURL("petImg", "assets/rabbit.jpeg");
      playSound("assets/category_loops/misguided_rabbit_chase_minimal_loop.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "Low") {
      recommendationText = "Hamster";
      setImageURL("petImg", "assets/hamster.jpg");
      playSound("assets/category_achievements/peaceful_win_1.mp3", false);
    } else {
      recommendationText = "Cat";
      setImageURL("petImg", "assets/kitty.jpg");
      playSound("assets/category_animals/cat.mp3", false);
    }

  // Medium Home
  } else if (homeSize == "Medium") {
    if (time <= 30 && budget == "Low") {
      recommendationText = "Fish or Hamster";
      setImageURL("petImg", "assets/fishamster.jpg");
      playSound("assets/category_achievements/bubbly_game_achievement_sound.mp3", false);
    } else if (time <= 30 && (budget == "Medium" || budget == "High")) {
      recommendationText = "Turtle 🐢";
      setImageURL("petImg", "assets/turts.jpeg");
      playSound("assets/category_jump/ninja_jump_2.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "Low") {
      recommendationText = "Rabbit";
      setImageURL("petImg", "assets/rabbit.jpeg");
      playSound("assets/category_loops/misguided_rabbit_chase_minimal_loop.mp3", false);
    } else if (time >= 91 && budget == "Medium") {
      recommendationText = "Small Dog";
      setImageURL("petImg", "assets/pup.jpg");
      playSound("assets/category_animals/puppy.mp3", false);
    } else if (time >= 91 && budget == "High") {
      recommendationText = "Dog";
      setImageURL("petImg", "assets/doggy.jpg");
      playSound("assets/category_animals/dog.mp3", false);
    } else {
      recommendationText = "Cat";
      setImageURL("petImg", "assets/kitty.jpg");
      playSound("assets/category_animals/cat.mp3", false);
    }

  // Large Home
  } else if (homeSize == "Large") {
    if (time <= 30 && budget == "Low") {
      recommendationText = "Fish";
      setImageURL("petImg", "assets/fish.jpg");
      playSound("assets/category_nature/south_carolina_beach_ripple.mp3", false);
    } else if (time <= 30 && (budget == "Medium" || budget == "High")) {
      recommendationText = "Turtle 🐢";
      setImageURL("petImg", "assets/turts.jpeg");
      playSound("assets/category_jump/ninja_jump_2.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "Low") {
      recommendationText = "Rabbit";
      setImageURL("petImg", "assets/rabbit.jpeg");
      playSound("assets/category_loops/misguided_rabbit_chase_minimal_loop.mp3", false);
    } else if (time >= 31 && time <= 90 && budget == "High") {
      recommendationText = "Dog";
      setImageURL("petImg", "assets/doggy.jpg");
      playSound("assets/category_animals/dog.mp3", false);
    } else if (time >= 91 && budget == "High") {
      recommendationText = "Dog";
      setImageURL("petImg", "assets/doggy.jpg");
      playSound("assets/category_animals/dog.mp3", false);
    } else {
      recommendationText = "Cat";
      setImageURL("petImg", "assets/kitty.jpg");
      playSound("assets/category_animals/cat.mp3", false);
    }
  }

  // Iteration (for loop) inside operate() — checks if this recommendation
  // is already in the history list before adding it
var isDuplicate = false;
for (var i = 0; i < recommendationHistory.length; i++) {
    if (recommendationHistory[i] == recommendationText) {
      isDuplicate = true;
    }
  }
if (!isDuplicate) {
    appendItem(recommendationHistory, recommendationText);
  }

  //Displays the final recommendation on the screen
setText("textOutput", recommendationText);
}

onEvent("errorText", "click", function() {
  console.log("errorText clicked!");
});