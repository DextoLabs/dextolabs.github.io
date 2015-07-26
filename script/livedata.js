
//      Constant Time Standard Deviation
//----------------------------------------
/*
* @params values the newest readings from myo
*/
var numbOfEntries = 200;
var entriesSoFar = 0;
var canReceive = false

var indexNormal = 0;
var indexPlus = 1;

var classyCount = 0

var sqSum = [0,0,0,0,0,0,0,0];
var totalMean = [0,0,0,0,0,0,0,0];
var allVal = new Array(8);

var ref = new Firebase("https://angelhacks.firebaseio.com/");
window.setup = false

for(i = 0; i < 8; i ++){
    allVal[i] = new Array(numbOfEntries);
}

myo.on('emg', function(data){
    if(canReceive){
        //console.log(findClosestVector(aggregateArray,addNewData(data)))
        var set9 = getProb(addNewData(data))
        var index99 = 0
        for(var i = 1; i < set9.length; i++){
            if(set9[i] > set9[index99]){
                index99 = i
            }
        }
        fingerData = index99
        console.log(index99)
        //console.log(addNewData(data))

    }else if(window.setup){
        addNewData(data)
    }
});

myo.on('connected', function(){
    console.log('connected')
    entriesSoFar =0
    myo.streamEMG(true);
});

function addNewData(values){
    //var sd = runningStandardDeviation(values)
    var sd = performWave(values)
    if(window.setup){
        classyCount++
        addClassifyer(sd, index)
        console.log('classy')
    }
    return sd
   
}

function runningStandardDeviation(values){
    var standardDeviation = [0,0,0,0,0,0,0,0];
    for(i = 0; i < 8; i ++){
        allVal[i][indexNormal] = values[i];
    }

    if(entriesSoFar  > numbOfEntries  ){
        for(i = 0; i < 8; i ++){
            sqSum[i] += allVal[i][indexNormal]*allVal[i][indexNormal] - allVal[i][indexPlus]*allVal[i][indexPlus];
            totalMean[i] += allVal[i][indexNormal]-allVal[i][indexPlus];

            standardDeviation[i] = Math.sqrt(sqSum[i]/numbOfEntries - (totalMean[i]/numbOfEntries)*(totalMean[i]/numbOfEntries));
        }
    }else{
        for(i = 0; i < 8; i ++){
            totalMean[i][indexPlus] += values[i];
            sqSum[i] += values[i]*values[i];
        }
    }
    
    //index to store all of the values
    indexNormal = indexPlus;
    indexPlus ++;
    indexPlus = indexPlus % numbOfEntries;

    entriesSoFar ++;
    return standardDeviation;
}

// Includes a full wave rectification and a running average
function performWave(newdata){

    var rectifiedData = []
    for(var i = 0; i < newdata.length; i++){
        if(newdata[i] <= 0){
            rectifiedData[i] = -1 * newdata[i];
        }else{
            rectifiedData[i] = newdata[i]
        }  
    }

    for(i = 0; i < 8; i ++){
        allVal[i][indexNormal] = rectifiedData[i];
    }

    if(entriesSoFar  > numbOfEntries  ){
        for(i = 0; i < 8; i ++){
            
            totalMean[i] += allVal[i][indexNormal]-allVal[i][indexPlus];

        }
    }else{
        for(i = 0; i < 8; i ++){
            totalMean[i][indexPlus] += rectifiedData[i];
            
        }
    }
    
    //index to store all of the values
    indexNormal = indexPlus;
    indexPlus ++;
    indexPlus = indexPlus % numbOfEntries;

    entriesSoFar ++;

    var returnval = []
    for(var i = 0; i < 8; i++){
        returnval[i] = totalMean[i]/numbOfEntries
    }
    return returnval
}


