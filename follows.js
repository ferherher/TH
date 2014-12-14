(function ( $ ){

	var key		= 'vTij3orvHd4oT7dl31HQXaNFap85row4X9CbqD79tSEV8e7b', // Unique master Xively API key to be used as a default
		TH_feed	= '2029082394', // Comma separated array of Xively Feed ID numbers
		TH_datastreams	= ['Bathroom','Saloon','BackCabin','Exterior','WaterTank','Engine'], //
		dataDuration	= '2days', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
		dataInterval	= 900;// Default interval for data to be displayed (in seconds)
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
	document.getElementById("myButtonDay").style.width = buttonWidth;
	document.getElementById("myButton2Day").style.width = buttonWidth;
	document.getElementById("myButtonWeek").style.width = buttonWidth;
	document.getElementById("myButtonMonth").style.width = buttonWidth;
	document.getElementById("myButton90Days").style.width = buttonWidth;

	// adding font size
	var valuesNowElement = document.querySelector("#valuesNow");
	var valuesFontSize = Math.floor(x/26);
	var valuesFontHeight = valuesFontSize*2.2
	valuesNowElement.style.fontSize =  valuesFontSize.toString() + "px" ;
	valuesNowElement.style.height = valuesFontHeight.toString() + "px" ;

	// Graph Annotations
	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(seriesData[2][seriesData[2].length-1].x, messages.shift());
		}
	}

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

	// Parse Xively ISO Date Format to Date Object
	Date.prototype.parseISO = function(iso){
		var stamp= Date.parse(iso);
		if(!stamp) throw iso +' Unknown date format';
		return new Date(stamp);
	}

	// Set xively API Key
	function setApiKey(key) {
		xively.setKey(key);
	}

	mySeries = new Array();

	function createGraph() {
		var interval = setInterval(function(){
			if(mySeries.length == TH_datastreams.length) {
				// Initialize Graph DOM Element
				$('#content .graph-group .graph').empty();
				$('#content .graph-group .legend').empty();
				$('#content .graph-group .legendSwitch').empty();
				$('#content .valuesNow').empty();
				var valuesNow 
				var allTemps = [];
				
				TH_datastreams.forEach(function(datastreamName){
					mySeries.forEach(function(thisSeries) {
						if (thisSeries.name == datastreamName){
							var thisTemp = [];
							thisSeries.data.forEach(function(thisData) {
								allTemps.push(thisData.y);
								thisTemp.push(thisData.y);
							});
							var minVal  = Math.min.apply(Math, thisTemp);
							var maxVal = Math.max.apply(Math, thisTemp);
							var lastValue = thisTemp[thisTemp.length - 1];
							var thisSeriesName =  thisSeries.name;
							if (thisSeriesName == 'BackCabin'){thisSeriesName = 'Bc'}
							else{thisSeriesName = thisSeriesName.substring(0,2) }
							$('#content .valuesNow').append('<li id=\"valuesNowLi\" style=\"width: 33%;\"><span style=\"color: ' + thisSeries.color + ';padding-right: 2px; \">' + thisSeriesName +':</span>' + lastValue + '<span style=\"font-size: 0.8em;\"> (' + minVal  + ' | '  + maxVal + ')</span></li>');
							
							//var valueNow =  '<li><span style=\"color: ' + thisSeries.color + '; \">' + thisSeries.name.substring(0,2) +': </span>'  + lastValue  + '</li>';
							
							
						};
					});
				});
				
				// add style for list width
				//var valuesNowElementLiWidth= Math.floor(x/3 - 4).toString() + "px"  ;
				//var valuesNowElements = document.querySelectorAll("#valuesNowLi");
				//for (var i = 0; i < valuesNowElements.length; i++) {
				//	valuesNowElements[i].style.width = valuesNowElementLiWidth;
				//}
				//valuesNowElements.forEach(function(thisValuesNowElement){console.log(thisValuesNowElement);});
				//console.log(valuesNowElementLiWidth);
					//thisValuesNowElement.style.width = valuesNowElementLiWidth;
				
				

				
				
				var minVal  = Math.min.apply(Math, allTemps);
				
				// Build Graph
				var graph = new Rickshaw.Graph( {
					element: document.querySelector('#graph'),
					width: x*0.9,
					height: y-250-valuesFontHeight,
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
				
				var legend = document.querySelector('#legend');
				var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
					render: function(args) {
						$('#content .graph-group .legend').empty();
						
						var legendDate = document.createElement('div');
						legendDate.className = 'legendDate';
						legendDate.innerHTML = args.formattedXValue.substring(4,29) ;
						legend.appendChild(legendDate);
						
						args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {
							var line = document.createElement('div');
							line.className = 'line';

							var swatch = document.createElement('div');
							swatch.className = 'swatch';
							swatch.style.backgroundColor = d.series.color;

							var label = document.createElement('div');
							label.className = 'label';
							label.innerHTML = d.name.substring(0,2)  + ": " + d.formattedYValue;

							line.appendChild(swatch);
							line.appendChild(label);

							legend.appendChild(line);

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
				
				clearInterval(interval);
			}
		}, 500);
	}

	function updateFeeds(feedId, datastreamIds, duration, interval) {

		xively.feed.get(feedId, function(feedData) {

			if(feedData.datastreams) {

				feedData.datastreams.forEach(function(datastream) {

					if(datastreamIds && datastreamIds != '' && datastreamIds.indexOf(datastream.id) >= 0) {
						var now = new Date();
						var then = new Date();
						var updated = new Date;
						updated = updated.parseISO(datastream.at);
						var diff = null;
						if(duration == '1day') diff = 86400000;
						if(duration == '2days') diff = 172800000;
						if(duration == '1week') diff = 604800000;
						if(duration == '1month') diff = 2628000000;
						if(duration == '90days') diff = 7884000000;
						then.setTime(now.getTime() - diff);
						if(updated.getTime() > then.getTime()) {

							console.log('Datastream requested! (' + datastream.id + ')');
						
							xively.datastream.history(feedId, datastream.id, {duration: duration, interval: interval, limit: 1000}, function(datastreamData) {
							points = [];
								// Historical Datapoints
								if(datastreamData.datapoints) {

									// Add Each Datapoint to Array
									datastreamData.datapoints.forEach(function(datapoint) {
										points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
									});
								}
								var mycolor = 'steelblue'
								var myrenderer = 'line'
								if(datastream.id ==  'Saloon') {mycolor = '#FFD462'; myrenderer = 'line'}
								if(datastream.id ==  'BackCabin') {mycolor = '#FC7D49'; myrenderer = 'line'}
								if(datastream.id ==  'Bathroom') {mycolor = '#CF423C'; myrenderer = 'line'}
								if(datastream.id ==  'WaterTank') {mycolor = '#BF244D'; myrenderer = 'line'}
								
								if(datastream.id ==  'Exterior') {mycolor = '#24ADA0'; myrenderer = 'line'}
								
								if(datastream.id ==  'Calorifier') {mycolor = '#FFFA7A'; myrenderer = 'line'}
								if(datastream.id ==  'Engine') {mycolor = '#24AD69'; myrenderer = 'line'}
								if(datastream.id ==  'Freezer') {mycolor = '#004C66'; myrenderer = 'line'}
								if(datastream.id ==  'Fridge') {mycolor = '#1760FF'; myrenderer = 'line'}
								if(datastream.id ==  'Temperature') {mycolor = '#3F0B1B'; myrenderer = 'line'}
								//B82A64					
								
								
								// Add Datapoints Array to Graph Series Array
								mySeries.push({
										name:datastream.id,
										data: points,
										color: mycolor,
										renderer : myrenderer,
								});
							});
						} else {
								$('#content .datastreams.datastreams .graphWrapper').html('<div class="alert alert-box no-info">Sorry, this datastream does not have any associated data.</div>');
						}
					} else {
								console.log('Datastream not requested! (' + datastream.id + ')');
					}
				// Create Datastream UI
				//$('.datastreams' ).empty();
				//$('.datastreams' ).remove();
				});
				createGraph();
			}
		});
	}

	function setFeeds(TH_feed, TH_datastreams) {
		id = TH_feed;
		xively.feed.history(id, {  duration: "2days", interval: 900 }, function (data) {
			$('#content .duration-day').click(function() {
				mySeries = []
				updateFeeds(data.id, TH_datastreams, '1day', 900);
				return false;
			});
			
			$('#content .duration-2days').click(function() {
				mySeries = []

				updateFeeds(data.id, TH_datastreams, '2days', 900);
				return false;
			});
			
			$('#content .duration-week').click(function() {
				mySeries = []
				updateFeeds(data.id, TH_datastreams, '1week', 900);
				return false;
			});

			$('#content .duration-month').click(function() {
				mySeries = []
				updateFeeds(data.id, TH_datastreams, '1month', 2400);
				return false;
			});

			$('#content .duration-90').click(function() {
				mySeries = []
				updateFeeds(data.id, TH_datastreams, '90days', 9600);
				return false;
			});

			// Handle Datastreams
			if(dataDuration != '' && dataInterval != 0) {
				updateFeeds(data.id, TH_datastreams, dataDuration, dataInterval);

			} else {
				updateFeeds(data.id, TH_datastreams, '1day', 900);
			}
		});
	}
// END Function Declarations

// BEGIN Initialization

	setApiKey(key);
	setFeeds(TH_feed,TH_datastreams);

// END Initialization

})( jQuery );
