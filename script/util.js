/*
* Finds the closes pre-recorded hand state to the current state
*@params aggregateArray The array of all pre-recorded vectors
*@params current The current Array of the hands state
*@returns the index in aggregate array of the closest pre-recorded state
*/
function findClosestVector(aggregateArray, current){
    
    var closestAngle = 100;//10 is greater than 2*pi
    var closesIndex = -1
    for(var i = 0; i < aggregateArray.length; i++){
        var curAngle = angleBetween(current,aggregateArray[i]);
        if(curAngle < closestAngle){
            closestAngle = curAngle;
            closesIndex = i;
        }
    }
    return closesIndex;
}


//  -------------- Standard Deviation Calculation -------------- //
var calculateStandardDeviation = function(dataset){
    return Math.sqrt(calculateVariance(dataset)/dataset.length)
}
var calculateVariance = function(dataset){
    var avg = calculateAverage(dataset)
    var diff = 0
    for(var i = 0; i < dataset.length; i++){
        diff+=((dataset[i]-avg) * (dataset[i]-avg))
    }

    return diff
}
var calculateAverage = function(dataset){
    var sum = 0
    for(var i = 0; i < dataset.length; i++){
        sum += dataset[i]
    }
    return (sum/dataset.length)
}

// Single Pass Standard Deviation Algorithm
var singlePassStandardDeviation = function(dataset){
    if(dataset.length == 0){
        return 0.0
    }
    var sum = 0.0
    var sq_sum = 0
    for(var i = 0; i < dataset.length; i++){
        sum = sum + dataset[i]
        sq_sum = sq_sum + (dataset[i] * dataset[i])
    }
    var mean = sum / dataset.length
    var variance = sq_sum / dataset.length - mean * mean
    return Math.sqrt(variance)
}

// ----------------------------------------------------------- //

//  --------------  Vector Calculation -------------- //
function angleBetween(vector1,vector2){
    var crossSum = 0;
    var length1 = 0;
    var length2 = 0;
    for(i = 0; i < vector1.length; i ++){
        crossSum += (vector1[i] * vector2[i]);
        length1 += vector1[i]*vector1[i];
        length2 += (vector2[i]) * vector2[i]
    }
    length1 = Math.sqrt(length1);
    length2 = Math.sqrt(length2);
    var angle = Math.acos(crossSum/(length1*length2));
    return angle;
}
// -------------------------------------------------- //

//----------------- EMG Filtering ------------------- //
function smoothArray( values, smoothing ){
  var value = values[0]; // start with the first input
  for (var i=1, len=values.length; i<len; ++i){
    var currentValue = values[i];
    value += (currentValue - value) / smoothing;
    values[i] = value;
  }
}

function rectifyAndAverage (values) {
    var returnvals = []
    var sum = 0
    for(var i = 0; i < values.length; i++){
        if(values[i] <= 0){
            returnvals[i] = -1 * values[i]
        }else{
            returnvals[i] = values[i]
        }
        sum += returnvals[i]
    }

    return sum/returnvals.length
}