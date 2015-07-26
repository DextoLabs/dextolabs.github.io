
	
/*
*Double integrates over the acceleration
*To find the change in position
*/

var lastX9 = 0;
var lastY9 = 0;
var lastZ9 = 0;

var xVelocity = 0;
var yVelocity = 0;
var zVelocity = 0;

var lastXVelocity = 0;
var lastYVelocity = 0;
var lastZVelocity = 0;

var lastTime = 0;
var currentTime = 0;
var twoTimesAgo = 0;

//position variables
var curX  = 0;
var curY = 0;
var curZ = 0;

var latestValues = [0,0,0]

//initialize to smooth array
var valuesToSmooth = 40;
var smoothingValues = new Array(3);
for(i = 0; i < 3; i ++){
	smoothingValues[i] = new Array(40);
	for(j = 0; j< smoothingValues[0].length; j++){
		smoothingValues[i][j] = 0
	}
}

var smoothIndex = 0;
var smoothIndexPlus = 0;
var total = [0,0,0];

var timesRun = 0;




function insertNewData( x,  y,  z){
	 
	currentTime = new Date().getTime();
	
	var difBetweenlast  =  currentTime - lastTime;
	var difTwo = (currentTime - twoTimesAgo)/2;

	xVelocity += difBetweenlast * ( (x  ));
	yVelocity += difBetweenlast * ( (y  ));
	zVelocity += difBetweenlast * ( (z  ));


	curX += difTwo * ((xVelocity + lastXVelocity)/2);
	curY += difTwo * ((yVelocity + lastYVelocity)/2);
	curZ += difTwo * ((zVelocity + lastZVelocity)/2);





		//update all of the variables
	twoTimesAgo = lastTime;
	lastTime = currentTime;

	lastXVelocity = xVelocity;
	lastYVelocity = yVelocity;
	lastZVelocity = zVelocity;

	lastX9 = x;
	lastY9 = y;
	lastZ9 = z;
	timesRun ++;
	
	smoothIndexPlus ++;
	smoothIndexPlus = smoothIndexPlus % valuesToSmooth;
	
	for( i = 0; i < 3; i ++){
		if(i == 0){
			smoothingValues[i][smoothIndex] = curX;
		} 
		if(i == 1) {
			smoothingValues[i][smoothIndex] = curY;
		}
		if(i == 2) {
			smoothingValues[i][smoothIndex] = curZ;
		}
		total[i] += smoothingValues[i][smoothIndex] - smoothingValues[i][smoothIndexPlus];
	}
	


	smoothIndex = smoothIndexPlus;
	
	if(timesRun > 3){
		var bigNumb = 100000000000000000000000;
		var xr = restrain((total[0]/valuesToSmooth),bigNumb,-bigNumb);
		var yr = restrain((total[1]/valuesToSmooth),bigNumb,-bigNumb);
		var zr = restrain((total[2]/valuesToSmooth),bigNumb,-bigNumb);
		

		// console.log(returnMe);
		latestValues = [xr,yr,zr]
		return returnMe;
	}
	else{
		//var returnMe = [0,0,0];
		//return returnMe;
	}
}

	function recenter(){
		curX = 0;
		curY = 0;
		curZ = 0;
		xVelocity = 0;
		yVelocity = 0;
		zVelocity = 0;
	}

	function restrain(val, top,bot){
		if(val > top){ return top;}
		if(val < bot){ return bot;}
		return val;
	}

