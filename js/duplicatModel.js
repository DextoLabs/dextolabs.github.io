$("#NextCalib").click(startInterval)
var calibprog = 0
 $(window).load(function(){
 		$("#calibModal").modal("hide")
    });
$('#calibModal').modal({
    backdrop: 'static',
    keyboard: false
})
$('#startModal').modal({
    backdrop: 'static',
    keyboard: false
})
$("#startCalib").click(calibStart)
function calibStart(){

	$("#startModal").modal("hide");
	$("#calibModal").modal('show');
}

var time = 5
function startInterval(){
	$("#NextCalib").hide()
	interval = setInterval(function(){timer()}, 1000)
}
function NextCalib(){
	
	var interval
	calibprog += 1
	
	$("#progress").css("width",(calibprog/8)*100 +"%")
	if(calibprog == 1){
		progModel("Move Your Index Finger Down and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 2){
		progModel("Move Your Middle Finger Up and Wait, Press Calibrate, a Few Seconds")	
	}
	else if(calibprog == 3){
		progModel("Move Your Middle Finger Down and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 4){
		progModel("Move Your Ring Finger Up and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 5){
		progModel("Move Your Ring Finger Down and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 6){
		progModel("Move Your Pinky Up and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 7){
		progModel("Move Your Pinky Down and Wait, Press Calibrate, a Few Seconds")
	}
	else if(calibprog == 8){
		$("#NextCalib").text("Done")
		$("#NextCalib").attr("data-dismiss","modal")
	}
	function progModel(text){
		$("#calibText").text("" + text)
		$("#NextCalib").show()
		var time = 5
	}
	
}
function timer(){
		$("#timeLeft").text("" + time)
		time--
		if(time==0){

			$("#timeLeft").text(" ")
			time = 5
			clearInterval(interval)
			NextCalib()
		}
	}