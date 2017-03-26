var startTime = 0
var start = 0
var end = 0
var diff = 0
var timerID = 0
var mins
var secs
var msecs
var totalmsecs

function chrono(){
	end = new Date()
	diff = end - start
	diff = new Date(diff)
	msecs = diff.getMilliseconds()
	secs = diff.getSeconds()
	mins = diff.getMinutes()
	if (mins < 10){
		mins = 0 + mins
	}
	if (secs < 10){
		secs = 0 + secs
	}
	if(msecs < 10){
		msecs = 0 +msecs
	}
	else if(msecs < 100){
		msecs = 0 +msecs
	}
	totalmsecs = msecs + (secs * 1000) + (mins * 60 * 1000);
	document.getElementById("chronotime").innerHTML = mins + ":" + secs + ":" + msecs
	timerID = setTimeout("chrono()", 10)
}


function chronoStart(){
	start = new Date()
	chrono()
}


function chronoStop(){
  console.log(mins + ":" + secs + ":" + msecs);
  clearTimeout(timerID)
}
