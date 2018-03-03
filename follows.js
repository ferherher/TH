(function ( $ ){

	var	TH_datastreams	= ["EX_T","SA_T","BA_T","BC_T","CA_T","WT_T","EN_T","FR_T"];
	var fieldList= [{field:1,mycolor:'#74AFE3'}, {field:2,mycolor:'#FFD462'}, 
					{field:3,mycolor:'#CF423C'}, {field:4,mycolor:'#FC7D49'},
					{field:5,mycolor:'#FFFA7A'}, {field:6,mycolor:'#2F9C9E'},
					{field:7,mycolor:'#48995C'}, {field:8,mycolor:'#1760FF'}],

		
		
		dataDuration	= '2days', 
		dataInterval	= 900,
		dataDurationButtonID		= "myButton2Day";
    var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    var TSid = unescape(temp[1]);
    temp = parameters[1].split("=");
    var TSkey = unescape(temp[1]);
	var mySeries = new Array();
		
		
	// Function Declarations
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight,
		buttonWidth =   Math.floor(x/5 -1).toString() + "px"  ;
	
	document.getElementById("main").style.width = x.toString() + "px" ;
	document.getElementById("main").style.height = y.toString() + "px" ;
	document.getElementById("button-group").style.height = (y*0.07).toString() + "px" ;
	document.getElementById("button-group").style.lineHeight = (y*0.07).toString() + "px" ;
	document.getElementById("myButtonDay").style.width = buttonWidth;
	document.getElementById("myButton2Day").style.width = buttonWidth;
	document.getElementById("myButtonWeek").style.width = buttonWidth;
	document.getElementById("myButtonMonth").style.width = buttonWidth;
	document.getElementById("myButton90Days").style.width = buttonWidth;


	// adding font size
	var legendElement = document.querySelector("#legend");
	var valuesFontSize = Math.floor(x/26);
	legendElement.style.height =  (x*0.065*(Math.ceil(fieldList.length/3))+valuesFontSize).toString() + "px" ;
	legendElement.style.fontSize =  valuesFontSize.toString() + "px" ;

	
	// Graph Annotations
	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(seriesData[2][seriesData[2].length-1].x, messages.shift());
		}
	};

	// Add One (1) Day to Date Object
	Date.prototype.addDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t + (d * 86400000);
			this.setTime(t);
		}
	};

	// Subtract One (1) Day to Date Object
	Date.prototype.subtractDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t - (d * 86400000);
			this.setTime(t);
		}
	};
	
	Date.prototype.format=function(e){
			var t="";
			var n=Date.replaceChars;
			for(var r=0;r<e.length;r++){
				var i=e.charAt(r);
				if(r-1>=0&&e.charAt(r-1)=="\\")
					{t+=i}
				else if(n[i])
					{t+=n[i].call(this)}
				else if(i!="\\"){t+=i}
			}
			return t
		};
		Date.replaceChars={
			shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
			d:function(){return(this.getDate()<10?"0":"")+this.getDate()},
			D:function(){return Date.replaceChars.shortDays[this.getDay()]},
			M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},
			y:function(){return(""+this.getFullYear()).substr(2)},
			H:function(){return(this.getHours()<10?"0":"")+this.getHours()},
			i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},
		}


	// Parse Xively ISO Date Format to Date Object
	Date.prototype.parseISO = function(iso){
		var stamp= Date.parse(iso);
		if(!stamp) throw iso +' Unknown date format';
		return new Date(stamp);
	}

	var buttonClicked = null;
	function highlight(id) {
		if(buttonClicked != null)
			{
			buttonClicked.style.background = "#d6d9db";
			}

		buttonClicked  = document.getElementById(id);
		buttonClicked.style.background =  "#eaeced";
	}

	
	function convertToDate(utcSeconds) {
		var myDate = new Date(0);
		myDate.setUTCSeconds(utcSeconds);
		var dateString = myDate.format('D, d M y, H:i');
		return dateString;
		}
	

	function createGraph() {
		//console.log('starting createGraph');
		// waait for the requeat to come back before continuing
		var numberOfPoints = setInterval(function(){
			if(mySeries.length == fieldList.length) {
				clearInterval(numberOfPoints);
				// Initialize Graph DOM Element
				$('#content .graph-group .graph').empty();
				$('#content .graph-group .legendSwitch').empty();
				$('#content .legend').empty();
				
				var valuesNow 
				var allMins = [];
				
				
				var legend = document.querySelector('#legend');
				var legendDate = document.createElement('div');
				
				legendDate.className = 'legendDate';
				legendDate.style.margin =  ("0 0 0"  + (valuesFontSize/4).toString() + "px") ;
				legend.appendChild(legendDate);
				mySeries.forEach(function(thisSeries) {
					//console.log(thisSeries.name + ' length '+ thisSeries.data.length);	
					if (thisSeries.data.length >= 8){

						var thisTemp = [];
						thisSeries.data.forEach(function(thisData) {
							thisTemp.push(thisData.y);
						});
						var minVal  = Math.min.apply(Math, thisTemp);
						allMins.push(minVal);
						var maxVal = Math.max.apply(Math, thisTemp);
						var lastValue = thisTemp[thisTemp.length - 1];
						
						var lastDate = new Date(0);
						var utcSeconds = thisSeries.data[thisSeries.data.length -1].x;

						var dateString = convertToDate(utcSeconds) ;
					
						
						legendDate.innerHTML = dateString;
						var thisSeriesName =  thisSeries.name;
						if (thisSeriesName == 'BackCabin'){thisSeriesName = 'Bc'}
						else{thisSeriesName = thisSeriesName.substring(0,2) }
						
						var line = document.createElement('li');
						line.id = 'valuesNowLi';
						line.style.width = '33%'
						
						var swatch = document.createElement('div');
						swatch.className = 'swatch';
						swatch.style.backgroundColor = thisSeries.color;
						swatch.innerHTML =  thisSeriesName;
						swatch.style.width  = (x*0.05).toString() + "px" ;
						swatch.style.height = (x*0.05).toString() + "px" ;
						
						
						var Tvalue = document.createElement('div');
						Tvalue.className = 'Tvalue';
						Tvalue.id = 'Tvalue_' +  thisSeries.name;
						//console.log( 'Tvalue_' +  thisSeries.name)
						Tvalue.innerHTML =  lastValue;
						
						var AveValue = document.createElement('div');
						AveValue.className = 'AveValue';
						AveValue.id = 'AveValue_' +  thisSeries.name;
						AveValue.style.paddingLeft = (valuesFontSize/4).toString() + "px" ;
						AveValue.innerHTML =  '(' + minVal  + ' | '  + maxVal + ')';
						
						
						line.appendChild(swatch);
						line.appendChild(Tvalue);
						line.appendChild(AveValue);
						
						legend.appendChild(line);
						
						
						$('#content .valuesNow').append('<li id=\"valuesNowLi\" style=\"width: 33%;\"><span style=\"color: ' + thisSeries.color + ';padding-right: 2px; \">' + thisSeriesName +':</span>' + lastValue + '<span style=\"font-size: 0.8em;\"> (' + minVal  + ' | '  + maxVal + ')</span></li>');
						
						//var valueNow =  '<li><span style=\"color: ' + thisSeries.color + '; \">' + thisSeries.name.substring(0,2) +': </span>'  + lastValue  + '</li>';
									
					};
				});
				
				// add style for list width
				//var valuesNowElementLiWidth= Math.floor(x/3 - 4).toString() + "px"  ;
				//var valuesNowElements = document.querySelectorAll("#valuesNowLi");
				//for (var i = 0; i < valuesNowElements.length; i++) {
				//	valuesNowElements[i].style.width = valuesNowElementLiWidth;
				//}
				//valuesNowElements.forEach(function(thisValuesNowElement){////console.log(thisValuesNowElement);});
				//////console.log(valuesNowElementLiWidth);
					//thisValuesNowElement.style.width = valuesNowElementLiWidth;
				
				


				
				var minVal  = Math.min.apply(Math, allMins);
				//console.log('minval '+ minVal);
				// Build Graph
				var graph = new Rickshaw.Graph( {
					element: document.querySelector('#graph'),
					width: x*0.9,
					height: y*0.5,
					renderer: 'line',
					interpolation: 'linear',
					min: minVal - 1,
					padding: {
						top: 0.02,
						right: 0.02,
						bottom: 0.02,
						left: 0.02
						},
					series: mySeries
				});
				
				graph.render();
				
				
				var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
					render: function(args) {
						
						//console.log(args)
						utcSeconds = args.detail[0].value.x;
						var dateString = convertToDate(utcSeconds) ;
						legendDate.innerHTML = dateString;
						
						args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {


							var Tvalue = document.querySelector('#Tvalue_' + d.series.name);
							//console.log(Tvalue);
							Tvalue.innerHTML = d.formattedYValue;

							var dot = document.createElement('div');
							dot.className = 'dot';
							dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
							dot.style.borderColor = d.series.color;

							this.element.appendChild(dot);

							dot.className = 'dot active';

							this.show();

						}, this );
						}
				});

				var hover = new Hover( { graph: graph } ); 

				var legendSwitch = new Rickshaw.Graph.Legend( {
					graph: graph,
					element: document.getElementById('legendSwitch')
				} );
				
				document.getElementById('legendSwitch').style.fontSize = (valuesFontSize*0.8).toString() + "px" ;
				
				
				var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
					graph: graph,
					legend: legendSwitch
				} );

				var ticksTreatment = 'inverse';

				// Define and Render X Axis (Time Values)
				var xAxis = new Rickshaw.Graph.Axis.Time( {
					graph: graph,
					ticksTreatment: ticksTreatment
				});
				
				xAxis.render();

				// Define and Render Y Axis (Datastream Values)
				var yAxis = new Rickshaw.Graph.Axis.Y( {
					graph: graph,
					tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
					ticksTreatment: ticksTreatment
				});
				
				yAxis.render();

				// Enable Datapoint Hover Values
				/*
				var hoverDetail = new Rickshaw.Graph.HoverDetail({
					graph: graph,
					formatter: function(series, x, y) {
						var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
						var content = swatch + series.name + ": " + parseInt(y) + '<br>' ;
						return content;
					}
				});
					*/
					
				var slider = new Rickshaw.Graph.RangeSlider({
					graph: graph,
					element: $('#slider')
				});
				
				
			}
		}, 500);
	}
	
	var myOffset = new Date().getTimezoneOffset();
	function getChartDate(d) {
		// get the data using javascript's date object (year, month, day, hour, minute, second)
		// months in javascript start at 0, so remember to subtract 1 when specifying the month
		// offset in minutes is converted to milliseconds and subtracted so that chart's x-axis is correct
		return Date.UTC(d.substring(0,4), d.substring(5,7)-1, d.substring(8,10), d.substring(11,13), d.substring(14,16), d.substring(17,19)) - (myOffset * 60000);
		}
	
	function updateFeeds(numberOfDays,interval) {
		var jsonString = 'https://www.thingspeak.com/channels/'+TSid+'/feeds.json?callback=?&amp;offset=0&amp;round=1;status=0;metadata=0;location=0;results='+numberOfDays*24*4+';key='+TSkey
		if(interval != 0) {jsonString = jsonString+';median='+interval};
		//console.log(jsonString);
		
		$.getJSON(jsonString, function(data) 
		{

		if(data != -1){
			console.log( data.feeds.length )
			for (var fieldIndex=0; fieldIndex<fieldList.length; fieldIndex++)  // iterate through each field
				{
				fieldList[fieldIndex].data =[];
				for (var h=0; h<data.feeds.length; h++)  // iterate through each feed (data point)
					{
					var p = []//new Highcharts.Point();
					var fieldStr = "data.feeds["+h+"].field"+fieldList[fieldIndex].field;
					var v = eval(fieldStr);
					//p[0] = getChartDate(data.feeds[h].created_at);
					p[0] = new Date(data.feeds[h].created_at).getTime()/1000.0
					p[1] = parseFloat(v);
					// if a numerical value exists add it
					if (!isNaN(parseInt(v))) { fieldList[fieldIndex].data.push({x:p[0], y:p[1]}); }
					}
				fieldList[fieldIndex].name = eval("data.channel.field"+fieldList[fieldIndex].field);
				};
				
				
			for (var fieldIndex=0; fieldIndex<fieldList.length; fieldIndex++)
				{
					// Historical Datapoints

					var mycolor = 'steelblue';
					var myrenderer = 'line';

					//B82A64					
					
					//////console.log(fieldList[fieldIndex].name);
					// Add Datapoints Array to Graph Series Array
					mySeries.push({
							name: fieldList[fieldIndex].name,
							data: fieldList[fieldIndex].data,
							color: fieldList[fieldIndex].mycolor,
							renderer : myrenderer,
					});
				};
			//} else {
						//$('#content .datastreams.datastreams .graphWrapper').html('<div class="alert alert-box no-info">Sorry, this datastream does not have any associated data.</div>');
				//}
			} else {
						console.log('no data from request!!');
			}
			// Create Datastream UI
			//$('.datastreams' ).empty();
			//$('.datastreams' ).remove();

			});
					//console.log(mySeries);
			createGraph();


		};

	function setFeeds() {

			$('#content .duration-day').click(function() {
				mySeries = []
				highlight('myButtonDay')
				updateFeeds(1,0);
				//console.log('click 1');
				return false;
			});
			
			$('#content .duration-2days').click(function() {
				mySeries = []
				highlight('myButton2Day')
				updateFeeds(2,0);
				//console.log('click 2');
				return false;
			});
			
			$('#content .duration-week').click(function() {
				mySeries = []
				highlight('myButtonWeek')
				updateFeeds(7,30);
				//console.log('click 7');
				return false;
			});

			$('#content .duration-month').click(function() {
				mySeries = []
				highlight('myButtonMonth')
				updateFeeds(30,60);
				//console.log('click 30');
				return false;
			});

			$('#content .duration-90').click(function() {
				mySeries = []
				highlight('myButton90Days')
				updateFeeds(90,240);
				return false;
			});

			// Handle Datastreams
			if(dataDuration != '' && dataInterval != 0) {
				highlight(dataDurationButtonID)
				updateFeeds(2,0);

			} else {
				updateFeeds(1,0);
			}
	}
// END Function Declarations
// BEGIN Initialization

	setFeeds();

// END Initialization

})( jQuery );
