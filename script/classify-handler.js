var trainer = [];

function addClassifyer(value2 , mode){
	trainer.push({
		event: ('' + mode), feature: value2
	});
}

function endClassification(){
	execute(trainer);
}

function getProb(value1){
	
	return getObservation(value1);
}

var classifier = {};
function execute(training){

	var featureProbability = [[], [], [], [], [], [], [], []];
	var trainingSamples = {};

	var featureId;

	for (var i = 0 ; i < training.length ; i++) {
		var train = training[i];

		if (! classifier[train.event]) {
			classifier[train.event] = [];
			trainingSamples[train.event] = 0;
			for (var j = 0 ; j < 8 ; j++) {
				classifier[train.event].push([]);
			}
		}

		trainingSamples[train.event]++;

		for (featureId = 0 ; featureId < 8 ; featureId++) {
			// The rounded feature value (0, 5, 10, 15, 20)
			var feature = train.feature[featureId];
			feature = feature - feature % 5;

			// Increment the feature probability being a certain value for this particular event.
			if (! classifier[train.event][featureId][feature]) {
				classifier[train.event][featureId][feature] = 0;
			}
			classifier[train.event][featureId][feature]++;

			// Increment the feature probability being a certain value over all training data.
			if (! featureProbability[featureId][feature]) {
				featureProbability[featureId][feature] = 1;
			}
			featureProbability[featureId][feature]++;
		}
	}

	for (var ev in classifier) {
		for (featureId = 0 ; featureId < 8 ; featureId++) {
			for (var featureValue = 0 ; featureValue < 50 ; featureValue += 5) {
				if (classifier[ev][featureId][featureValue] == null) {
					classifier[ev][featureId][featureValue] = 0;
				}
				else {
					classifier[ev][featureId][featureValue] = classifier[ev][featureId][featureValue] / trainingSamples[ev];
				}
			}
		}
	}

	for (featureId = 0 ; featureId < 8 ; featureId++) {
		for (var featureValue = 0 ; featureValue < 50 ; featureValue += 5) {
			if (featureProbability[featureId][featureValue] == null) {
				featureProbability[featureId][featureValue] = 1;
			}
			featureProbability[featureId][featureValue] = featureProbability[featureId][featureValue] / training.length;
		}
	}

	// console.log(classifier);
}
	
function getObservation (observation){
	var returnr = {};
	var observe = [];
	var probs = []
	for (var featureId = 0 ; featureId < 8 ; featureId++) {
		observe[featureId] = observation[featureId] - observation[featureId] % 5;
	}

	var totalProbability = 1;
	for (var ev in classifier) {
		totalProbability = 1;
		for (var featureId = 0 ; featureId < 8 ; featureId++) {
			var featureValue = observe[featureId];
			var probability = classifier[ev][featureId][featureValue]; /// featureProbability[featureId][featureValue];
			//console.log(ev + ' - ' + featureId + ' - ' + probability + ' (expected ' + featureProbability[featureId][featureValue] + ')');
			if (probability == 0) {
				probability = 0.0001;
			}
			totalProbability *= probability;
		}
		
		console.log(ev + ': ' + totalProbability);

		probs.push(totalProbability)

	}
	return probs;
}
	

