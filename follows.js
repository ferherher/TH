(function ( $ ){

	var key		= 'vTij3orvHd4oT7dl31HQXaNFap85row4X9CbqD79tSEV8e7b', // Unique master Xively API key to be used as a default
		TH_feed	= '2029082394', // Comma separated array of Xively Feed ID numbers
		TH_datastreams	= ['Exterior','Temperature','Calorifier'],
		dataDuration	= '1day', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
		dataInterval	= 60;// Default interval for data to be displayed (in seconds)
// Function Declarations

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

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
	
	window.mySeries = new Array();

	
	function createGraph() {

		var interval = setInterval(function(){
			if(mySeries.length == TH_datastreams.length) {
				var allTemps = []

				mySeries.forEach(function(thisSeries) {
					myData = thisSeries.data
					myData.forEach(function(thisData) {
						allTemps.push(thisData.y);
					});
				});
				var minVal  = Math.min.apply(Math, allTemps)
				var maxVal = Math.max.apply(Math, allTemps)
				// Fill Datastream UI with Data
				$('#feed .datastreams .datastream-value').html('min: ' + minVal + ' | max: ' + maxVal);
				console.log(minVal)
				console.log(maxVal)
				// Initialize Graph DOM Element
				$('#feed .datastreams .graph').empty();
				$('#feed .datastreams .graph').attr('id', 'graph');
				$('#feed .datastreams .legend').empty();
				$('#feed .datastreams .legend').attr('id', 'legend');
				$('#feed .datastreams .legendSwitch').empty();
				$('#feed .datastreams .legendSwitch').attr('id', 'legendSwitch');
				
				
				// Build Graph
				var graph = new Rickshaw.Graph( {
					element: document.querySelector('#graph'),
					width: x-100,
					height: y -300,
					renderer: 'line',
					interpolation: 'linear',
					min: minVal,
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

						legend.innerHTML = args.formattedXValue;

						args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {

							var line = document.createElement('div');
							line.className = 'line';

							var swatch = document.createElement('div');
							swatch.className = 'swatch';
							swatch.style.backgroundColor = d.series.color;

							var label = document.createElement('div');
							label.className = 'label';
							label.innerHTML = d.name + ": " + d.formattedYValue;

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

				var order = new Rickshaw.Graph.Behavior.Series.Order( {
					graph: graph,
					legend: legendSwitch
				} );

				var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
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
				
				var hoverDetail = new Rickshaw.Graph.HoverDetail({
					graph: graph,
					formatter: function(series, x, y) {
						var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
						var content = swatch + series.name + ": " + parseInt(y) + '<br>' ;
						return content;
					}
					
					
				});
				
				$('#feed .datastreams.datastreams .slider').prop('id', 'slider');
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
								if(datastream.id ==  'Exterior') {mycolor = "#c05020"; myrenderer = 'line'}
								if(datastream.id ==  'Temperature') {mycolor = "#30c020"; myrenderer = 'line'}
								if(datastream.id ==  'Calorifier') {mycolor = 'steelblue'; myrenderer = 'line'}
								
								// Add Datapoints Array to Graph Series Array
								mySeries.push({
										name:datastream.id,
										data: points,
										color: mycolor,
										renderer : myrenderer,
								});
								
							});

						} else {
								$('#feed .datastreams.datastreams .graphWrapper').html('<div class="alert alert-box no-info">Sorry, this datastream does not have any associated data.</div>');
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


		xively.feed.history(id, {  duration: "6hours", interval: 30 }, function (data) {
			if(data.id == id) {

				// Date Updated
				$('#feed .updated .value').html(data.updated);


				$('#feed .duration-day').click(function() {
					mySeries = []
					updateFeeds(data.id, TH_datastreams, '1day', 60);
					return false;
				});
				
				$('#feed .duration-2days').click(function() {
					mySeries = []

					updateFeeds(data.id, TH_datastreams, '2days', 120);
					return false;
				});
				
				$('#feed .duration-week').click(function() {
					mySeries = []
					updateFeeds(data.id, TH_datastreams, '1week', 900);
					return false;
				});

				$('#feed .duration-month').click(function() {
					mySeries = []
					updateFeeds(data.id, TH_datastreams, '1month', 1800);
					return false;
				});

				$('#feed .duration-90').click(function() {
					mySeries = []
					updateFeeds(data.id, TH_datastreams, '90days', 10800);
					return false;
				});

				// Handle Datastreams
				if(dataDuration != '' && dataInterval != 0) {
					updateFeeds(data.id, TH_datastreams, dataDuration, dataInterval);

				} else {
					updateFeeds(data.id, TH_datastreams, '1day', 60);
				}

			} else {
				// Duplicate Example to Build Feed UI
				$('#exampleFeedNotFound').clone().appendTo('#feeds').attr('id', 'feed-' + id).removeClass('hidden');
				$('#feed-' + id + ' h2').html(id);
			}
		});

	}
// END Function Declarations

// BEGIN Initialization

	var today = new Date();
	var yesterday = new Date(today.getTime()-1000*60*60*24*1);
	var lastWeek = new Date(today.getTime()-1000*60*60*24*7);


	setApiKey(key);
	setFeeds(TH_feed,TH_datastreams);

// END Initialization

})( jQuery );
