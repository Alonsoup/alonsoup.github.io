var bgcolor;
var sliderR;
var sliderG;
var sliderB;
var paragraph;
var bgRed;
var bgGreen;
var bgBlue
var redTag;
var greenTag;
var blueTag;
var topScoreList = [];
var weakestScoreKey;


  // Initialize Firebase
  //An object with properties used by firebase (provided by it).
  var config = {
    apiKey: "AIzaSyCCqP0lpokcR5BsZVNNSmJ92djALmOPomQ",
    authDomain: "match-colors.firebaseapp.com",
    databaseURL: "https://match-colors.firebaseio.com",
    storageBucket: "match-colors.appspot.com",
    messagingSenderId: "788248103124"
  };
  //The object is passed to firebase.
  firebase.initializeApp(config);

  //A database instance is created.
  var database = firebase.database();

  //ref is a reference to the root node of the database, which we call 'scores'. We use it in submit to push data.
  var ref = database.ref('scores');

  //topTenScores is a reference
  var topTenScores = database.ref('scores').orderByChild('totalmsecs');

  //We add a listener and a handler to it.
  topTenScores.on('value', gotData, errData);

  function gotData(data) {
    //We reset the topScoreList
    topScoreList=[];
    //We create a list containing all lis previously created by this function.
    var scoreListings = selectAll('.scoreListing');
    //We remove all previous lis. We want to update, not pile them.
    for (var i = 0; i < scoreListings.length; i++) {
      scoreListings[i].remove();
    }

    //thanks to orderByChild, the objects in data are ordered.
    //data is an object that contains objects (child) that contain methods that return objects (entry)
    //that contain properties (name, mins, secs, msecs). WTF. I know.
    //childs are sorted within data based on the property 'secs' of the entry object, obtained by calling .val() on childs.
    //for each loops through the childs in data.
    data.forEach(function(child) {
        //for every child, we create an object (entry), by calling child.val()
        var entry = child.val();
        //we access the entry properties
        var name = entry.name;
        var mins = entry.mins;
        var secs = entry.secs;
        var msecs = entry.msecs;
        var totalmsecs = entry.totalmsecs;
        //child.key contains the key to an entry. We store the last one (with the highest time) in a global variable.
        //This way, if necessary, we can remove the entry in submit.
        weakestScoreKey = child.key;
        //topScoreList is used in check to see if the user score is better than the existing high scores.
        topScoreList.push(totalmsecs);
        //We create an li for every child/entry (there's only one entry per child).
        var li = createElement('li', name + ': ' + mins + ':' + secs + ':' + msecs);
        //A class is added to every li so they can be selected and removed at the beginning of gotData.
        li.class('scoreListing');
        li.parent('scoreList');
    });
  }//gotData


  //Handler function that deals (poorly) with errors when retrieving data from database.
  function errData(err) {
    console.log('Error!');
    console.log(err);
  }

function setup() {
  //The submitScore div is hidden until the user wins and sets a score that can be submitted.
  document.getElementById('submitScore').style.display = 'none';

  //The highScores div is hidden by default, until the user hits the highScoresButton and activates toggleHighScores.
  document.getElementById('highScores').style.display = 'none';

  //The checkButton is hidden until the user starts a newGame
  document.getElementById('checkButton').style.display = 'none';

  //canvas is created and bound to parent div
  canvas = createCanvas(400, 400);
  canvas.parent(sketch_holder);

  //Until the user presses triggers newGame, the background color is set to grey.
  bgcolor = color(200);

  // Buttons. Created in the HTML file. Referenced and bound here.
  newGameButton = select("#newGameButton");
  newGameButton.mousePressed(newGame);

  checkButton = select('#checkButton');
  checkButton.mousePressed(check);

  submitButton = select('#submitButton');
  submitButton.mousePressed(submit);

  highScoresButton = select('#highScoresButton');
  highScoresButton.mousePressed(toggleHighScores);

  //This is the paragraph that is updated to show messages
  paragraph = createP('');
  paragraph.style('text-align','center');

  // Sliders
  sliderR = createSlider(0,255,0);
  redTag = createP('');

  sliderG = createSlider(0,255,0);
  greenTag = createP('');

  sliderB = createSlider(0,255,0);
  blueTag = createP('');
} //setup


//Display or hide the highScores div
function toggleHighScores() {
  var x = document.getElementById('highScores');
  if (x.style.display === 'none') {
      x.style.display = 'block';
  } else {
      x.style.display = 'none';
  }
}


/*Generates random values (RGB) for the background color, applies them and resets the paragraph text.
This function is bound to the buttonNewGame button.*/
function newGame() {
  //We show the checkButton
  document.getElementById('checkButton').style.display = 'block';

  bgRed = random(255);
  console.log('Red:' + bgRed);
  bgGreen = random(255);
  console.log('Green:' + bgGreen);
  bgBlue = random(255);
  console.log('Blue:' + bgBlue);

  bgcolor = color(bgRed, bgGreen, bgBlue);

  paragraph.html('');

  // stopwatch is started
  chronoStart();
}

/*This function compares the slider inputs (the user guess) with the correct values.
If the guess is correct, we stop the stopwatch and show the div where they can enter their name
and submit their score to the database.
Otherwise, we show a message.
*/
function check() {
  //We hide the checkButton
  document.getElementById('checkButton').style.display = 'none';
  //We check if the guess is correct
  if (sliderR.value() > bgRed - 10 && sliderR.value() < bgRed + 10 &&
      sliderG.value() > bgGreen - 10 && sliderG.value() < bgGreen + 10 &&
      sliderB.value() > bgBlue - 10 && sliderB.value() < bgBlue + 10 ) {
    //stopwatch is stopped
    chronoStop();
    //If there are less than ten highScores in the database, any score is considered a highscore.
    if (topScoreList.length < 10) {
      document.getElementById('submitScore').style.display = 'block';
    }
    //If there are ten or more scores in the database, we need to compare the user score with the worst existing one.
    //topScoreList is already ordered so we just look at its last element.
    else if (totalmsecs < topScoreList[topScoreList.length-1]) {
      document.getElementById('submitScore').style.display = 'block';
    }
    //if the user score isn't a high score, we still congratulate him for winning, but don't let him submit.
    else {
      paragraph.html('Good Job!');
    }
  }
  //if he hasn't even won, we show him a message.
  else {
    paragraph.html('Not quite there.');
    document.getElementById('checkButton').style.display = 'block';
  }
}//check

// Creates an object with the player's name and score and pushes it to firebase.
function submit() {
  if (topScoreList.length >= 10) {
    //We delete the database entry with the highest time.
    firebase.database().ref("scores/" + weakestScoreKey).remove()
  }
  var data = {
    name: document.getElementById('userName').value,
    mins: mins,
    secs: secs,
    msecs: msecs,
    //We never print totalmsecs. We create it because it's easier to compare a single value.
    //This is what orderByChild looks at when sorting.
    totalmsecs: totalmsecs
  }

  var result = ref.push(data);
  console.log(result.key);

  //Hide submitScore div
  document.getElementById('submitScore').style.display = 'none';
}//submit

function draw() {
  /* The background color is set to bgcolor.
  It's set to 200 until it is randomly generated by the newGame function.*/
  background(bgcolor);

  //The ellipse color is determined by the sliders.
  fill(sliderR.value(), sliderG.value(), sliderB.value());
  noStroke();
  ellipse(200, 200, 200, 200);

  //The color tags are updated with values from the sliders.
  redTag.html('Red: ' + sliderR.value());
  greenTag.html('Green: ' + sliderG.value());
  blueTag.html('Blue: ' + sliderB.value());
}
