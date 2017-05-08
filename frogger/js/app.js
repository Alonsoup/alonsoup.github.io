var character;
var allEnemies = [];
var gemArray = [];
var powerUpArray = [];
var trips = 0;
var totalTrips = 0;
var isDead;
var weakestScoreKey;
var user;
//I'm using P5.JS for DOM manipulation. setup declaration is required.
function setup() {};

/***********************************FIREBASE**************************************
*****************************************************************************/
// Initialize Firebase
//An object with properties used by firebase (provided by it).
var config = {
  apiKey: "AIzaSyDsUfD-wmpZUX7r9L-MgkgGbzVnNl1dubU",
  authDomain: "frogger-a95a7.firebaseapp.com",
  databaseURL: "https://frogger-a95a7.firebaseio.com",
  projectId: "frogger-a95a7",
  storageBucket: "frogger-a95a7.appspot.com",
  messagingSenderId: "193515327531"
};

firebase.initializeApp(config);

/***********************************DATABASE**************************************/
/*The rules in the console are set to allow anyone to read the data but only authenticated users
to write on their entry (not on each other's).
*/
var database = firebase.database();

//ref is a reference to the root node of the database, which we call 'users'.
var ref = database.ref('users');

//For the ranking, we request a list of the entries sorted by their negScore property
//TODO: limit the query to ten results.
var topTenScores = database.ref('users').orderByChild('negScore');

topTenScores.on('value', gotData, errData);

//This function is triggered whenever a new value is added to the DB.
//It builds the html list with the contents of the data from the DB.
function gotData(data) {
  //We create a list with all the previous lis created by this function and we delete them.
  //This way, we update the list, instead of piling lis.
  var scoreListings = selectAll('.scoreListing');
  for (var i = 0; i < scoreListings.length; i++) {
    scoreListings[i].remove();
  };
  //We loop through the data and create an li for every user.
  data.forEach(function(child) {
    var entry = child.val();
    var name = entry.name;
    var score = entry.score;
    weakestScoreKey = child.key;
    var li = createElement('li', name + ': ' + score);
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

document.getElementById("submitButton").onclick = submit;
//The set method creates a new user if it doesn't already exist and updates it if it does.
//The DB entry id matches the logged in user's id.
function submit() {
  firebase.database().ref('users/' + user.uid).set({
    name: user.displayName,
    score: player.score,
    negScore: player.score * -1
  });
  document.getElementById("recordP").style.display = 'none';
  document.getElementById('submitDiv').style.display = 'none';
}


/********************************AUTHENTICATION***********************************/

var provider = new firebase.auth.GoogleAuthProvider();

//Button naming and binding
const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', signIn);

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', e => {
  firebase.auth().signOut();
});

//Maybe this should be an anonymous function, like we do with signOut.
function signIn() {
  //There are two methods to show the login screen: a pop-up and a redirect.
  firebase.auth().signInWithPopup(provider).then(function(result) {
    //Here we have access to the user object (result), but I prefer to handle that (up next) with  a realtime
    //listener: onAuthStateChanged.
  }).catch(function(error) {
    //We handle sign in errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage + errorCode);
  });
}//signIn


//We add a realtime listener to change the UI depending on wheter a user is logged in.
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    //We make the user object globally available.
    user = firebaseUser;
    //We hide and show stuff. There's a lot of this.
    logoutButton.classList.remove('hide');
    loginButton.classList.add('hide');
    document.getElementById('loginP').style.display = 'none';
    //This deals with logins that happen after a game has finished.
    //We check the signed-in user's highscore in the DB and compare it to the current score.
    return firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
      var highestScore = snapshot.val().score;
      if (highestScore < player.score) {
        document.getElementById('submitButton').style.display = 'inline-block';
        document.getElementById('recordP').style.display = 'block';
      }else {
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('recordP').style.display = 'none';
      }
    }).catch(function(error) {
      //This is run if there's a user signed-in but they don't hava a DB entry yet.
      document.getElementById('submitButton').style.display = 'inline-block';
    });
  }else {
    //When a user is logged out, we don't want the global variable user to keep the user object.
    user = undefined;
    logoutButton.classList.add('hide');
    loginButton.classList.remove('hide');
    document.getElementById('submitButton').style.display = 'none';
    document.getElementById('loginP').style.display = 'block';
    document.getElementById("highScoreP").style.display = 'none';
    document.getElementById("recordP").style.display = 'none';
  }
});



/***********************************ENEMIES***********************************
*****************************************************************************/
// Constructor function for enemies
var Enemy = function() {
    this.x = 0;
    this.y = Math.floor((Math.random() * 120) + 200);
    this.width = 80;
    this.height = 150;
    this.r = 35;
    this.speed = Math.floor((Math.random() * 200) + 70);
    this.sprite = 'images/enemy-bug.png';
};

// Parameter: dt, a time delta between ticks
//This method is called in a loop by engine.js
Enemy.prototype.update = function(dt) {
  // Multiplying the dt parameter ensures the game runs at the same speed for
  // all computers.
  this.x = this.x + this.speed * dt;
  if (this.hitsPlayer()) {
    allEnemies.splice(allEnemies.indexOf(this), 1);
    player.lives -=1;
  }
  if (this.x > 600){
    allEnemies.splice(allEnemies.indexOf(this), 1);
  };
};

//These methods were so common ammong constructors that they are declared as global functions.
//They could also be declared as part of a new superclass.
Enemy.prototype.render = render;
Enemy.prototype.hitsPlayer = hitsPlayer;


/***********************************PLAYER************************************
*****************************************************************************/
//Constructor function for the player
var Player = function () {
  this.x = 200;
  this.y = 400;
  this.width = 100;
  this.height = 200;
  this.r = 40;
  this.lives = 3;
  this.score = 0;
  this.sprite = 'images/' + character + '.png';
};

//Every 3 trips to the water, we instantiate a heart and a star
Player.prototype.update = function () {
  if (trips > 0 && trips%3 == 0) {
    trips = 0;
    powerUpArray.push(new Star());
    powerUpArray.push(new Heart());
  };
  if (this.lives < 0) {
    isDead = true;
  }
};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x-this.width/2, this.y-this.height/2, this.width, this.height);
    //Draw a heart for every life
    for (var i = 0; i < this.lives; i++) {
      ctx.drawImage(Resources.get('images/Heart.png'), i * 22, 50, 20, 35);
    };
    document.getElementById('scoreP').innerHTML = 'Score: ' + player.score;
};

Player.prototype.handleInput = function (key) {
  if (key == 'up' && this.y > 80 ) {
    this.y -= 10;
  }
  if (key == 'down' && this.y < 505) {
    this.y += 10;
  }
  if (key == 'left' && this.x > 30) {
    this.x -= 10;
  }
  if (key == 'right' && this.x < 470) {
    this.x += 10;
  }
};


/***********************************GEMS**************************************
*****************************************************************************/
var Gem = function (value, sprite) {
  this.x = Math.floor(Math.random() * 450);
  this.y = 70;
  this.width = 30;
  this.height = 40;
  this.r = 5;
  this.value = value;
  this.sprite = sprite;
};

Gem.prototype.update = function() {
  if (this.hitsPlayer()) {
    player.score += this.value;
    console.log(player.score);
    gemArray.splice(gemArray.indexOf(this), 1);
    if (gemArray.length == 0) {
      trips ++;
      totalTrips ++;      
    };
  };
};

Gem.prototype.render = render;
Gem.prototype.hitsPlayer = hitsPlayer;


/***********************************STATUE************************************
*****************************************************************************/
var Statue = function () {
  this.x = 50;
  this.y = 510;
  this.width = 90;
  this.height = 90;
  this.r = 40;
  this.sprite = 'images/Statue.png';
  this.star = false;
};

//When the player gets close to the statue, we instantiate a random batch of gems.
//If the player has grabbed a star, we increase the chances of getting more gems
//and of the gems having a value of 10
Statue.prototype.update = function () {
  if (this.hitsPlayer() && gemArray.length == 0) {
    var dieSides;
    if (statue.star) {
      dieSides = 4;
      amountOfGems = Math.floor((Math.random() * 6) + 10);
      statue.star = false;
    } else {
      dieSides = 3;
      amountOfGems = Math.floor((Math.random() * 6) + 5);
    }
    for (var i = 0; i < amountOfGems; i++) {
      var roll = Math.floor((Math.random() * dieSides) + 1);
      console.log('roll: ' + roll);
      if (roll == 1) {
        value = 1;
        sprite = "images/Gem Green.png";
      } else if (roll == 2) {
        value = 5;
        sprite = "images/Gem Blue.png";
      } else {
        value = 10;
        sprite = "images/Gem Orange.png";
      }
      var gem = new Gem(value, sprite);
      gemArray.push(gem);
    };
  };
};

Statue.prototype.render = render;
Statue.prototype.hitsPlayer = hitsPlayer;


/***********************************POWERUPS**********************************
*****************************************************************************/
//PowerUp is a superclass
var PowerUp = function () {
  this.x = Math.floor(Math.random() * 450);
  this.y = Math.floor((Math.random() * 120) + 200);
  this.r = 5;
  this.width = 20;
  this.height = 35;
};

// PowerUp.prototype.render = render;
PowerUp.prototype.render = render;
PowerUp.prototype.hitsPlayer = hitsPlayer;

/***********************************STAR************************************/
//Star is a PowerUp subclass
var Star = function () {
  PowerUp.call(this);
  this.sprite = 'images/Star.png';
};

Star.prototype = Object.create(PowerUp.prototype);

Star.prototype.constructor = Star;

//This method is called in a loop by engine.js
Star.prototype.update = function() {
  if (this.hitsPlayer()) {
    statue.star = true;
    console.log('Wee! Got Star!');
    powerUpArray.splice(powerUpArray.indexOf(this), 1);
  };
};

/***********************************HEART***********************************/
//Heart is a PowerUp subclass
var Heart = function () {
  PowerUp.call(this);
  this.sprite = 'images/Heart.png';
};

Heart.prototype = Object.create(PowerUp.prototype);

Heart.prototype.constructor = Heart;

//This method is called in a loop by engine.js
Heart.prototype.update = function() {
  if (this.hitsPlayer()) {
    player.lives ++;
    console.log('Heart Grabbed!');
    powerUpArray.splice(powerUpArray.indexOf(this), 1);
  };
};


// We instantiate the objects.
var player = new Player();
var statue = new Statue();

// We place all enemy objects in an array called allEnemies, used by engine.js
//Using setInterval is not the best option. I should create a loop with a dynamic delay variable.
function createEnemy() {
  allEnemies.push(new Enemy());
};
setInterval(createEnemy, 1200);


//Both hitsPlayer and render could be declared as part of a superclass constructor. I tried adding hitsPlayer to
//the global object prototype, but it caused a lot of hard to debug problems when Firebase was added.
//Instead, I add them to each class constructor that needs them.

//(1)In hitsPlayer we check for collisions with the player
//We use pythagoras to calculate the distance between the center of the object and that of the player.
//r stands for radius. If the sum of the radii is greater than dist, it means the objects are touching.
//This makes for circular colliders, which are... good enough.
function hitsPlayer() {
  var cathA = this.x - player.x;
  var cathB = this.y - player.y;
  var dist = Math.sqrt(cathA*cathA + cathB*cathB);
  return Boolean(dist < this.r + player.r);
}

//(2)All the game objects had this method declared as separate functions. Declaring one function
// and then just pointing to it is more memory efficient.
//drawImage draws the top left corner of the sprite at the given location so we need to create an offset
//so the center of the sprite matches the coordinates and the collisions can be detected more accurately.
function render() {
  ctx.drawImage(Resources.get(this.sprite), this.x-this.width/2, this.y-this.height/2, this.width, this.height);
};


// This listens for key presses and sends the keys to Player.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
