
var app = {
	/* data objects */
	monthArray: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	dayArray: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	dataObject: "",
	selectedClockObj: "",
	clockObjArray: [],
	
	/* counters/flags */ 
	maxClockCount: 4,
	currentClockCount: 0,
	currentClockId: 0,
	triggerEventListeners: false,
	clockModeNormal: true,										/* true = 12 hr clock (AM/PM); false = 24 hr clock */
	clockModeStr: "",
	
    /* Application Constructor */
    initApplication: function() {	
		app.loadData();
    },
	
	/* */
	loadData: function() {
	
		$.get( "data/appData.json", function() {
			//alert( "success" );
		})
		.done(function(data, status, xHR) {
			/* Simple browser testing */
			app.dataObject = data;
			
			/* Emulator */
			//app.dataObject = $.parseJSON(data);
			
			/* DYNAMIC DATA */
			var timeZones = new Bloodhound({
				datumTokenizer: function(timeZone) { 
					return Bloodhound.tokenizers.whitespace(timeZone.timeZoneLabel); 
				},
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				limit: 5,
				local: app.dataObject.timeZones
			});
			
			timeZones.initialize();
			
			$('#timeZoneDropdownMenu .typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				name: 'timeZones',
				displayKey: 'timeZoneLabel',
				source: timeZones.ttAdapter()
			});
			
			/* Enable sorting on clockContainer to allow drag-drop with snap */
			$("#clockContainer").sortable();
						
			app.eventListeners();
			
		})
		.fail(function(xHR, status, error) {
			//console.log("Error :: ");
			//alert('Error');
		})
		.always(function(xHR, status, error) {
			//alert( "finished" );
		});
		
	},
	
	/* Event listeners */
	eventListeners: function() {
		$("#addClockBtn").css("width", "32px");
		$("#optionsBtn").css("width", "32px");
		
		$("#addClockBtn").hover(
			function(){
				$(this).animate({ width: 110, height: 38}, 200);
			},
			function(){
				$(this).animate({width: 32,height: 38}, 200);
			}
		);
		
		$("#optionsBtn").hover(
			function(){
				$(this).animate({ width: 97, height: 38}, 200);
			},
			function(){
				$(this).animate({width: 32,height: 38}, 200);
			}
		);
		
		$("#addClockBtn").on("click", function(){
			if(app.clockObjArray.length < app.maxClockCount){			
				$("#timeZoneSelectorModal").modal("show");
				$("#btnAdd").addClass("disabled");
			}else{
				// No more clocks allowed. Show modal with message
				$("#errorModal").modal("show");
				$("#errorModal .modal-body").html("<p>You can add a maximum of four clocks.</p>");
				return;
			}
		});
				
		$("#timeZoneSelectorModal").on("typeahead:selected", function(eventObj, suggestionObj, dataSetObj){
			app.selectedClockObj = suggestionObj;				
			$("#btnAdd").removeClass("disabled");			
		});
		
		$("#btnAdd").on("click", function(){
			$("#timeZoneInput").val("");			
			if(app.clockAdded(app.selectedClockObj)){
				$("#errorModal").modal("show");
				$("#errorModal .modal-body").html("<p>You may not add a clock that is already added.</p>");
			}else{
				app.currentClockCount++;
				app.clockObjArray.push(app.selectedClockObj);
				app.loadClocks(app.currentClockCount, app.clockObjArray);
				
				$(".clock-remove").css("width", "0px");
				
				$(".btn-settings").on("click", function(e){
					e.preventDefault();
					var settingsId = $(this).attr("id");
					alert("settingsId : " + settingsId);
				});
				
				$(".btn-close").on("click", function(e){
					e.preventDefault();
					var closeId = $(this).attr("id");
					app.currentClockId = "clock" + closeId.substr(closeId.length-2, 2);
					$("#clockDeleteModal").modal("show");
				});
				
				$(".btn-delete-clock").on("click", function(e){
					e.preventDefault();
					for(var index in app.clockObjArray){
						if(app.currentClockId == "clock" + app.clockObjArray[index].timeZoneId.substr(app.clockObjArray[index].timeZoneId.length-2, 2)){
							app.currentClockCount--;
							app.clockObjArray.splice(app.getIndex(app.currentClockId), 1);
							$("#" + app.currentClockId).remove();
							$("#clockDeleteModal").modal("hide");
							break;
						}
					}
				});
				
				$("#optionsBtn").on("click", function(){
					if(app.clockObjArray.length){
						$("#optionsModal").modal("show");						
						$("#btnOptionsSave").on("click", function(){							
							// 12/24 hr
							if($("input:radio[name='optionsClockMode']:checked").attr("value") == "12"){
								app.clockModeNormal = true;
							}else{
								app.clockModeNormal = false;
							}
							app.updateClock(app.clockObjArray);
						});
					}
				});
				
				$(".clock-list-item").hover(
					// mouseover
					function (){
						hoverId = $(this).attr("id");
						$("#close" + hoverId.substr(hoverId.length-2, 2)).animate({width: '13px'}, 200);
					},
					// mouseout
					function(){
						hoverId = $(this).attr("id");
						$("#close" + hoverId.substr(hoverId.length-2, 2)).animate({width: '0px'}, 200);
					}
				);
			}
		});
		
		
	},
	
	/* Load Clocks one-by-one */
	loadClocks: function(clockCount, clockObjArray){
		var clockId = "";
		var checkId = "";
		var cityId = "";
		var settingsId = "";
		var closeId = "";
		var dateId = "";
		var timeId = "";
		var hourId = "";
		var minuteId = "";
		var secondId = "";
		
		var clockHTML = "";
		
		$("#clockContainer").empty();
		
		// create markup for clock
		$.each(clockObjArray, function(clockObj){
			var idStr = this.timeZoneId.substr(this.timeZoneId.length-2, 2);
			clockId = "clock" + idStr;
			checkId = "checkBox" + idStr;
			cityId = "city" + idStr;
			settingsId = "settings" + idStr;
			closeId = "close" + idStr;
			dateId = "date" + idStr;
			timeId = "time" + idStr;
			//hourId = "hour" + idStr;
			//minuteId = "minute" + idStr;
			//secondId = "second" + idStr;
			clockModeId = "clockMode" + idStr;
			
			/* DEFAULT THEME LIST ITEM */
			/* clockHTML += "<div id='" + clockId + "' class='list-group-item'><div class='list-group-item-heading'><h4 id='" + cityId + "' class='pull-left'></h4><div class='pull-right'><a href='#' role='button' id='" + settingsId + "' class='btn-settings' ><img src='img/gear.png' /></a><a href='#' role='button' id='" + closeId + "' class='btn-close'><img src='img/cross.png' /></a></div><div style='clear: both;'></div></div><div class='list-group-item-text'><div><h5 id='" + dateId + "' class='pull-left'></h5><br/><br/><h5 id='" + timeId + "' class='pull-left'></h5></div><div style='clear: both;'></div></div></div>"; */
			
			/* THEMED PANEL */
			/* clockHTML += "<div id='" + clockId + "' class='panel panel-primary'><div class='panel-heading'><h3 id='" + cityId + "' class='panel-title pull-left'></h3><div class='pull-right'><a href='#' role='button' id='" + settingsId + "' class='btn-settings' ><img src='img/gear.png' /></a><a href='#' role='button' id='" + closeId + "' class='btn-close'><img src='img/cross.png' /></a></div><div style='clear: both;'></div></div><div class='panel-body'><div class='pull-left'><p id='" + dateId + "'></p><p id='" + timeId + "'></p><div style='clear: both;'></div></div></div>"; */
			
			/* THEMED LIST ITEM */
			/* clockHTML += "<a href='#' id='" + clockId + "' class='list-group-item'><p class='list-group-item-heading'><h4 id='" + cityId + "' class='pull-left'></h4><div class='clearfix'></div></p><p class='list-group-item-text'><p id='" + dateId + "' class='pull-left'></p><p class='pull-right'><span id='" + hourId + "' ></span>:<span id='" + minuteId + "' ></span>&nbsp;<span id='" + clockModeId + "'>" + app.clockModeStr + "</span></p><p class='clearfix'></p></p></a>"; */
			
			clockHTML += "<a href='#' id='" + clockId + "' class='clock-list-item'><div class='row pad-top-10'><div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'><img id='" + closeId + "' src='img/cross.png' class='clock-remove btn-close' /></div><div class='col-xs-6 col-sm-6 col-md-6 col-lg-6'><p id='" + cityId + "' class='clock-city'></p></div><div class='col-xs-4 col-sm-4 col-md-4 col-lg-4'><div class='pull-right'><p id='" + dateId + "' class='clock-time-date'></p><p id='" + timeId + "' class='clock-time-date'></p></div></div><div class='clearfix'></div></div></a>";
			
			
		});
		
		// add clock to container
		$("#clockContainer").append(clockHTML);
			
		app.updateClock(clockObjArray);
	},
	
	/* Update clock every second */
	updateClock: function(clockObjArray) {
		
		$.each(clockObjArray, function(clockObj){
			var dayPhase = "";
			var clockObj = this;
			var clockId = clockObj.timeZoneId.substr(clockObj.timeZoneId.length - 2, 2);
			
			// update the tag with id "countdown" every 1 second
			setInterval(function () {
				var localDate = new Date();
				var displayDate = "";
				if(clockObj.timeZoneOffset.indexOf(".") > -1){
					displayDate = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours() + Math.floor(parseInt(clockObj.timeZoneOffset) + parseInt(clockObj.timeZoneDST)), localDate.getUTCMinutes() + 30, localDate.getUTCSeconds(), localDate.getUTCMilliseconds());
				}else{
					displayDate = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), localDate.getUTCHours() + parseInt(clockObj.timeZoneOffset) + parseInt(clockObj.timeZoneDST), localDate.getUTCMinutes(), localDate.getUTCSeconds(), localDate.getUTCMilliseconds());
				} 
				
				//console.log('Offset ' + parseInt(this.timeZoneOffset));
				//console.log('Local Time ' + newDate.getHours() + ' : ' + newDate.getMinutes() + ' : ' + newDate.getSeconds());
				//console.log('UTC Time ' + newDate.getUTCHours() + ' : ' + newDate.getUTCMinutes() + ' : ' + newDate.getUTCSeconds());
				//console.log('Offset Time ' + offSetDate.getHours() + ' : ' + offSetDate.getMinutes() + ' : ' + offSetDate.getSeconds());
				
				var displayHours = displayDate.getHours();
				
				if(app.clockModeNormal){					
					if(displayHours < 12){
						app.clockModeStr = "AM";
						displayHours = (displayHours != 0) ? displayHours : 12;
					}else if(displayHours >= 12){
						app.clockModeStr = "PM";
						displayHours = (displayHours - 12 != 0) ? (displayHours - 12) : 12;
					}
				}
				else{
					app.clockModeStr = "";
				}
				
				$("#city" + clockId).html(clockObj.timeZoneLabel);
				$("#date" + clockId).html(app.dayArray[displayDate.getDay()] + " " + app.monthArray[displayDate.getMonth()] + " " + displayDate.getDate());
				$("#time" + clockId).html(app.appendZero(displayHours) + ":" + app.appendZero(displayDate.getMinutes()) + " " + app.clockModeStr);
				
				/* Added beautification - this code snippet attaches bg image to clock based on time of day */
				/* There are four - morning / midday / evening / night 										*/
				/* Enable this only when taking screenshots as display gets skewed in higher resolutions 	*/
				/********************************************************************************************/
				/* if(displayDate.getHours() >= 8 && displayDate.getHours() < 12){
					dayPhase = "url('img/morning.png')";
				}else if(displayDate.getHours() >= 12 && displayDate.getHours() < 16){
					dayPhase = "url('img/midday.png')";
				}else if(displayDate.getHours() >= 16 && displayDate.getHours() < 20){
					dayPhase = "url('img/evening.png')";
				}else{
					dayPhase = "url('img/night.png')";
				}
				
				var backgroundImg = $("#clock" + clockId + " .row").css("background-image");
				if(backgroundImg == "none"){
					$("#clock" + clockId + " .row").css("background-image", dayPhase);
					$("#clock" + clockId + " .row").css("background-size", "100% 100%");
					$("#clock" + clockId + " .row").css("background-repeat", "no-repeat");
				} */
				/********************************************************************************************/
				
			 
			}, 1000);
		
		});
		
	},
	
	/* Mini function to append 0 if num is between 0 and 9 inclusive */
	appendZero: function (val) {
		//console.log("val : " + val);
		var retVal = "";
		
		if( val >= 0 && val < 10)
			retVal = "0" + val;
		else	
			retVal = val;
			
		return retVal; 
	},
	
	/* function to check if clock is already added */
	clockAdded: function(clockObj){
		for(var index in app.clockObjArray){
			if(app.clockObjArray[index].timeZoneId == clockObj.timeZoneId){
				return true;
				break;
			}	
		}
	},
	
	/* */
	getIndex: function(clockId) {
		var timeZoneId = "timeZone" + clockId.substr(clockId.length - 2, 2);
		for(var index in app.clockObjArray){
			if(app.clockObjArray[index].timeZoneId === timeZoneId){
				break;
			}
		}
		return index;
	}
};


