function setup() {
  loadJSON("https://teamtreehouse.com/alonsoserrano.json", gotData);
}

function gotData(data) {
  createElement('h1', data.name);
  for (var i = 0; i < data.badges.length; i++) {
    createP(data.badges[i].name);
    var img = createImg(data.badges[i].icon_url);
    img.size(100,100);
  }
}
