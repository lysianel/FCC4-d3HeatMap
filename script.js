//HeatMap with D3

document.addEventListener('DOMContentLoaded', function(){

	fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
		.then((response) => {
			if (response.ok){
				return response.json(); 
			}
			else {
				var error = new Error ('Error' + response.status + ": " + response.statusText);
				error.response = response;
				throw error;  
			}
		},
		error => {
			var errmess = new Error(error.message);
			throw errmess;  
		})
		.then(response => plotdata(response))
		.catch(error => { console.log(error.message); alert(error.message); })


	function allocateColor(value, colors, minTemp, maxTemp){

		//split the temperature range in equal segments allocated to one color
		
		const nbColors = colors.length; 
		const intervalTemp = (maxTemp - minTemp ) / nbColors;

		for (i = 0 ; i < nbColors ; i++){
			
			if (value == maxTemp) {
				return colors[nbColors - 1];
			}

			else if ( (value - minTemp) >= (i * intervalTemp) && (value - minTemp) < ( (i+1) * intervalTemp) ){
				return colors[i];
			}
		}
	}

	function plotdata(dataset){

		// Data
		const baseTemp = dataset.baseTemperature;
		dataset = dataset.monthlyVariance; 

		//Title
		d3.select("main")
		  .append("h1")
		  .attr("id", "title")
		  .text("Monthly Global Land-Surface Temperature");
		
		d3.select("main")  
		  .append("p")
		  .attr("id", "description")
		  .text("Monthly heat map from 1753 to 2015 ; Base Temperature : 8.66 °C");

		//Domain 
		const minYear = d3.min(dataset, d => d.year);
		const maxYear = d3.max(dataset, d => d.year);	
		const minTemp = d3.min(dataset, d => d.variance);	
		const maxTemp = d3.max(dataset, d => d.variance);

		//Parameters
		const h = 500;
		const w = 1200;
		const padding = 75;
		const colors = ["#463A94", "#563A8C", "#6C3A83", "#8B3A75", "#AC3A66", "#B83B62", "#CE3B57", "#DE3B51", "#F3313E"]; 
		const months = ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September',
    				'October', 'November', 'December'];
		const barWidth = (w - 2 * padding) / (maxYear - minYear); 
		const barHeight = (h - 1.5 * padding) / 12; 

		d3.select("main").style("width", w + "px");

		//Scale
		const xScale = d3.scaleLinear()
						 .domain([minYear, maxYear])
						 .range([padding, w - padding]);

		const yScale = d3.scaleLinear()
					     .domain([12, 1])
					     .range([h - padding, padding]);

		//Def Axes
		const x_axis = d3.axisBottom()
						 .ticks(20,"d")
						 .scale(xScale);

		const y_axis = d3.axisLeft()
						 .tickFormat( d => months[d - 1])
						 .scale(yScale);

		//Prepare plot
		const svg = d3.select("main")
					  .append("svg")
					  .attr("width", w)
					  .attr("height", h);

		//Plot axes
		svg.append("g")
		   .attr("id","x-axis")
		   .attr("transform","translate(0,"+ ( h - padding ) + ")")
		   .call(x_axis); 

		
		svg.append("g")
		   .attr("id","y-axis")
		   .attr("transform","translate(" + padding + ")")
		   .call(y_axis);

		//Add axis label
		svg.append("text")
		    .attr("text-anchor", "end")
		    .attr("x", w/2)
		    .attr("y", h - padding/2)
		    .text("Year");

		svg.append("text")
		    .attr("text-anchor", "end")
		    .attr("x", - h / 3 )
		    .attr("y", padding/2 - 10)
		    .attr("transform","rotate(-90)")
		    .text("Month");

		//Tooltip
		const tooltip = d3
			.select("main")
			.append("div")
			.attr("id","tooltip")
			.style("visibility","hidden")
			.style("position","absolute");
		
		//Plot Rect
		svg.selectAll("rect")
		   .data(dataset)
		   .enter()
		   .append("rect")
		   .attr("x", (d) => xScale(d.year))
		   .attr("y", (d) => yScale(d.month - 1))
		   .attr("class","cell")
		   .attr("height", barHeight)
		   .attr("width", barWidth)
		   .attr("fill", d => allocateColor(d.variance, colors, minTemp, maxTemp))
		   .attr("data-year", d => d.year)
		   .attr("data-month", d => d.month - 1)
		   .attr("data-temp", d => d.variance + baseTemp)
		   .on("mouseover", function(event,d) {
		   		tooltip.transition().duration(100).style("visibility", "visible");
		   		tooltip.html(months[d.month -1] + " " + d.year + "<br>" +
		   					 (d.variance + baseTemp).toFixed(2) + " °C" + "<br>" +
		   					 d.variance + " °C"	)
		   			   .style("left",  xScale(d.year) + 20 + "px" )
		   			   .style("top", yScale(d.month) + padding + "px")
		   			   .attr("data-year", d.year);
		   		d3.select(event.target).style("opacity",0.8);	
		  	})   
		  	.on("mouseout",function(event){
		  		tooltip.transition().duration(100).style("visibility", "hidden");
		  		d3.select(event.target).style("opacity","1");
		  	})

		//Legend
		d3.select("main")
		  .append("p")
	  	  .text("Temperature Range(°C)")

		const legend = d3.select("main")
	  	  			     .append("svg")
	  	  			     .attr("id","legend")

	  	const nbColors = colors.length; 
	  	const wLegend = 300 ;
	  	const hLegend = wLegend / nbColors ;

	  	let legendLabel=[]; 
	  	for (var i = 0; i < nbColors ; i++){
	  		legendLabel.push(baseTemp + minTemp + i *(maxTemp - minTemp ) / nbColors);
	  	}

	  	legend.selectAll("rect")
	  		  .data(colors)
	  		  .enter()
	  		  .append("rect")
	  		  .attr("x", (d, i) => i * wLegend / nbColors)
	  		  .attr("y", (d, i) => hLegend - wLegend / nbColors )
	  		  .attr("width", wLegend / nbColors)
	  		  .attr("height", wLegend / nbColors)
	  		  .attr("fill", (d, i) => colors[i]);

	  	let scaleLegend = d3.scaleLinear()
	  						.domain([minTemp + baseTemp, maxTemp + baseTemp])
	  						.range([0, wLegend]);
	  	
	  	const axis_legend = d3.axisBottom()
	  						  .scale(scaleLegend)
	  						  .tickValues(legendLabel)
	  						  .tickFormat(d3.format(".1f"));	  

	  	legend.append('g')
		  	  .attr("id","axisLegend")
		  	  .attr("transform","translate( 0, " + hLegend + ")")
		  	  .call(axis_legend);	  		  		  
	} 
});