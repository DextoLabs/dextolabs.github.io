var myo = Myo.create();
var latestEMG = []

var history = [[]] // History of values on all 8 ports

var aggregateArray = [[], [], [], [], [], [], [], []]

var recording = false

var historyIndex = 0

myo.on('emg', function(data){
	latestEMG = data
	if(recording){
		history[historyIndex] = data
		historyIndex++
	}
});

myo.on('connected', function(){
	console.log('connected')
	myo.streamEMG(true);
	myoIsConnected = true;
});
