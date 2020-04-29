document.addEventListener('DOMContentLoaded', function() {

    generateScatter(200, 4);

    document.getElementById("scatter-200").addEventListener("click", function(){
        generateScatter(200, 4);
    });

    document.getElementById("scatter-100").addEventListener("click", function(){
        generateScatter(100, 5);
    });

    document.getElementById("scatter-50").addEventListener("click", function(){
        generateScatter(50, 6);
    });
}, false);

function generateScatter(filterOption, dotSize) {
    //var dataCSV = d3.csv("/static/data/goldTest.csv");
    document.getElementById('scatter_plot').innerHTML = "";
    var margin = {top: 30, right: 30, bottom: 50, left: 80},
        width = 1000 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#scatter_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

//Read the data
    d3.json("/static/data/top200TracksD3.json", function(data) {
        data.forEach(function(d) {d.Streams = +d.Streams;}); //Convert things to numbers...because they're numbers...
        data.forEach(function(d) {d.Position = +d.Position;});
        data = data.filter(function(d){return d.Position <= filterOption});
        var max = d3.max(data, function(d) { return d.Streams; });
        var min = d3.min(data, function(d) { return d.Streams; });
        min = min - 10000;
        console.log(d3.max(data, function(d) { return d.Position; }));
        console.log(max);
        console.log(min);
        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, filterOption])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([min, max])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
        // Its opacity is set to 0: we don't see it by default.
        var tooltip = d3.select("#scatter_plot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        var mouseover = function(d) {
            tooltip
                .style("opacity", 1)
        }

        var mousemove = function(d) {
            tooltip
                .html("The exact value of<br>the Ground Living area is: " + d.Streams + "\nPos= "+d.Position)
                .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", ((d3.mouse(this)[1]) + 250) + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var mouseleave = function(d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data) // the .filter part is just to keep a few dots on the chart, not all of them
            //.data(data.filter(function(d){return d.Position <= filterOption})) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.Position); } )
            .attr("cy", function (d) { return y(d.Streams); } )
            .attr("r", dotSize)
            .style("fill", "#1DB954")
            //.style("opacity", 0)
            .style("stroke", "black")
            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )

        svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2) )
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("text-decoration", "underline")
        .text(`Streams vs Top ${filterOption} Position`);

        svg.append("text")      // text label for the x axis
        .attr("x", width/2 )
        .attr("y", 720 )
        .style("text-anchor", "middle")
        .text("Position");

        svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 4)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("# of Streams");

    })
}