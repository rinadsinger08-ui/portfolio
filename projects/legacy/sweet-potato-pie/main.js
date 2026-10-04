onEvent("welcomeScreen", "mouseover", function( ) {
  onEvent("continue", "click", function( ) {
    setScreen("intended_limitations");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("intended_limitations", "mouseover", function( ) {
  onEvent("continue2", "click", function( ) {
    setScreen("USregion");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("USregion", "mouseover", function( ) {
  onEvent("continue3", "click", function( ) {
    setScreen("mainDish");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("mainDish", "mouseover", function( ) {
  onEvent("continue4", "click", function( ) {
    setScreen("stuffingBase");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("stuffingBase", "mouseover", function( ) {
  onEvent("continue5", "click", function( ) {
    setScreen("cornbread");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("cornbread", "mouseover", function( ) {
  onEvent("continue6", "click", function( ) {
    setScreen("mac");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
onEvent("mac", "mouseover", function( ) {
  onEvent("continue7", "click", function( ) {
    setScreen("pumpkin");
    playSound("sound://category_app/app_button_1.mp3", false);
  });
});
var data = {};
onEvent("predict", "click", function() {
    addPair(data, "USregion", getText("USregion_dropdown"));
    addPair(data, "Maindish", getText("Maindish_dropdown"));
    addPair(data, "Stuffingbase", getText("Stuffingbase_dropdown"));
    addPair(data, "Cornbread", getText("Cornbread_dropdown"));
    addPair(data, "Macandcheese", getText("Macandcheese_dropdown"));
    addPair(data, "Pumpkinpie", getText("Pumpkinpie_dropdown"));
    setText("Sweetpotatopiepredictor_prediction", '');
    getPrediction("Sweet potato pie predictor", "7OzvcMgZlpTs", data, function(value) {
      if (value == "No") {
        setScreen("No");
        playSound("sound://category_bell/vibrant_game_slot_machine_ding_2.mp3", false);
      }
      if (value == "Yes") {
        setScreen("Yes");
        playSound("sound://category_app/app_button_1.mp3", false);
      }
      setText("Sweetpotatopiepredictor_prediction", value);
    });
  });