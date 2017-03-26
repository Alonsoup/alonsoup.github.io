var segments = [];
var spot = 0;
var spotsTakenParagraph;
var chosenWordsList = [];
var chosenWordsDiv;
var circlePublished;

function setup() {
  //The rotate method in publishCircle depends on these two settings
  imageMode(CENTER);
  angleMode(DEGREES);

  //The canvas is created
  canvas = createCanvas(500,500);
  background('white');
  canvas.parent(canvasDiv);

  // //publish, clear and save buttons are selected and binded to their functions
  $('#publish').click(publishCircle);
  $('#clear').click(clearFunc);
  $('#save').click(savePhrase);

  //We select the menu buttons. They clear the menu of images loaded by others and make a request for new items.
  //The arguments given to albumRequest are Flickr album IDs. There's an album for verbs, one for nouns, etc.
  $('#verbs').click(function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    $('#menuColumn1').empty();
    $('#menuColumn2').empty();
    albumRequest('72157678767190460');
  });

  $('#nouns').click(function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    $('#menuColumn1').empty();
    $('#menuColumn2').empty();
    albumRequest('72157680246652956');
  });

  $('#adjectives').click(function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    $('#menuColumn1').empty();
    $('#menuColumn2').empty();
    albumRequest('72157677375993701');
  });

  $('#pronouns').click(function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    $('#menuColumn1').empty();
    $('#menuColumn2').empty();
    albumRequest('72157677375993701');
  });

  $('#adverbs').click(function() {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    $('#menuColumn1').empty();
    $('#menuColumn2').empty();
    albumRequest('72157677375993701');
  });

  //A paragraph with status updates is created
  spotsTakenParagraph = createP(spot + '/4 segments chosen.');
  spotsTakenParagraph.parent('console');

  //The 'console' paragraph containing the selected words.
  chosenWordsDiv = createDiv('');
  chosenWordsDiv.parent('console');

  //Verbs are shown by default when launching the app.
  albumRequest('72157678767190460');


  /*This function makes the request to the Flickr API. We use the flickr.photosets.getPhotos method*/
  function albumRequest(gallery_id) {
    var apiURL = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=62bf0a2f78f6598c1b3e87c3cd3c5f53&photoset_id=';
    apiURL += gallery_id + '&user_id=151932795%40N05&format=json&nojsoncallback=1';
    var flickrOptions = {
      format: 'json'
    }
    $.getJSON(apiURL, flickrOptions, displayAlbum);
  }


  /*This is the callback function that handles the getJSON response from albumRequest.
  The loop creates the Dictionary menu with all the available words in english and heptapod
  mousePressed is used to trigger the addSegment function when an image is clicked*/
  function displayAlbum(data) {
    console.log(data);
    for (var i = 0; i < data.photoset.photo.length; i++) {
      //We build the url from the pieces of data from the Flickr API.
      var imgURL = 'https://farm' +
        data.photoset.photo[i].farm +
        '.staticflickr.com/' +
        data.photoset.photo[i].server +
        '/' +
        data.photoset.photo[i].id +
        '_' +
        data.photoset.photo[i].secret +
        '.jpg';

      var img = createImg(imgURL);
      img.mousePressed(addSegment);
      //Since img is what calls addSegment, I add info as properties so I can access it there using 'this'.
      img.wordString = data.photoset.photo[i].title;
      //This will later be used by addSegment to load the image and store it in segments.
      img.path = imgURL;
      img.size(100, 100);

      var imageText = createP(img.wordString);

      //I'm using a two column layout for the menu. Pairs go left, odds go right.
      if (i%2 == 0) {
        img.parent(menuColumn1);
        imageText.parent(menuColumn1);
      }else {
        img.parent(menuColumn2);
        imageText.parent(menuColumn2);
      } //else
    }//for
  }//displayAlbum


    /*segments is a list of loaded image objects. The user must fill all four spaces by triggering addSegment */
    function addSegment() {
      if (spot < 4) {
          //This loads only the objects of the chosen words. It's a sort of preload.
          //"this" refers to the img object created in displayAlbum
          //loadImage() takes a URL and creates an object that image() can use to publish to the canvas.
          segments[spot] = loadImage(this.path);
          spot += 1;
          //spotsTakenParagraph is updated
          spotsTakenParagraph.html(spot + '/4 segments chosen.');
          //The chosen word text is added to chosenWordsList.
          chosenWordsList.push(this.wordString);

          //We add every word to the cohsenWordsDiv as a paragraph.
          var wordListHTML = "";
          for (var i = 0; i < chosenWordsList.length; i++) {
            wordListHTML += "<p>" + chosenWordsList[i] + "</p>";
            chosenWordsDiv.html(wordListHTML);
          }//for
        }//if
      }// addSegment


    /*The for loop iterates through the segments list and creates an image for every item.
    translate moves the whole grid and places coordinates 0,0 where specified in the arguments. The effects are cumulative
    so we need to reset them before rotating.
    rotate rotates the whole grid on its 0,0 axis*/
    function publishCircle() {
      if (spot == 4) {
        circlePublished = true;
        $('#publish').removeClass('publishSelected');
        $('#save').addClass('saveSelected');

        translate(250, 250);
        image(segments[0], 0, -175, 275, 90);

        for (var i = 1; i < segments.length; i++) {
          translate(0, 0);
          rotate(90);
          image(segments[i], 0, -175, 275, 90);
        }// for
      }// if
    }// publishCircle


    function clearFunc() {
      // Reset spot to 0
      spot = 0;
      spotsTakenParagraph.html(spot + '/4 segments chosen.');
      // clear segments
      segments = [];
      // clear words from "console"
      chosenWordsList = [];
      chosenWordsDiv.html(chosenWordsList);
      // clear circle from canvas.
      clear();
      $('#save').removeClass('saveSelected');
      circlePublished = false;
    }// clearFunc

    function savePhrase() {
      saveCanvas('heptapod', 'jpg');
    }
}//setup

function draw() {
  /*Here, we take care of 'activating' and 'deactivating' the buttons.
  The 'save' button is handled in publishCircle and clearFunc, as well as the circlePublished boolean.*/
  if (spot > 0) {
    $('#clear').addClass('clearSelected');
  }else {
    $('#clear').removeClass('clearSelected');
  }
  if (spot == 4 && !circlePublished) {
    $('#publish').addClass('publishSelected');
  }else {
    $('#publish').removeClass('publishSelected');
  }
}//draw
