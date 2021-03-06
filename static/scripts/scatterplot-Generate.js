var isSwitched = true;
document.addEventListener('DOMContentLoaded', function() {

    var toggleCurve = false;
    var filter = 200;
    var dot = 4;
    var curve = 1.5;
    isSwitched = true;

    generateScatter(filter, dot, toggleCurve, curve);

    document.getElementById("scatter-200").addEventListener("click", function(){
        filter = 200;
        dot = 4;
        curve = 2;
        isSwitched = true;
        generateScatter(filter, dot, toggleCurve, curve);
    });

    document.getElementById("scatter-100").addEventListener("click", function(){
        filter = 100;
        dot = 5;
        curve = 2.5;
        isSwitched = true;
        generateScatter(filter, dot, toggleCurve, curve);
    });

    document.getElementById("scatter-50").addEventListener("click", function(){
        filter = 50;
        dot = 6;
        curve = 3;
        isSwitched = true;
        generateScatter(filter, dot, toggleCurve, curve);
    });

    document.getElementById("toggle-curve").addEventListener("click", function(){
        if(toggleCurve) {
            toggleCurve = false;
        }

        else if(!toggleCurve) {
            toggleCurve = true;
        }

        generateScatter(filter, dot, toggleCurve, curve);
    });

}, false);

function generateScatter(filterOption, dotSize, toggle_curve, curve_width) {

    document.getElementById('scatter_plot').innerHTML = "";
    var margin = {top: 30, right: 30, bottom: 50, left: 80};
    var width = 960 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    // add svg
    var svg = d3.select("#scatter_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/static/data/top200TracksD3.json", function(data) {

        data.forEach(function(d) {d.Streams = +d.Streams;}); //Convert things to numbers...because they're numbers...
        let counter = 0;
        data.forEach(function(d) {
            d.Position = +d.Position;
            counter++;
        });


        //Instead of call to backend just update the nav-bar here
        document.getElementById("nav-ratio-holder").innerHTML=counter + " / 200 Tracks Visualized ";

        data = data.filter(function(d){return d.Position <= filterOption});

        var max = d3.max(data, function(d) { return d.Streams; });
        var min = d3.min(data, function(d) { return d.Streams; });
        min = min - 10000;

        // x
        var x = d3.scaleLinear()
            .domain([0, 0])
            .range([ 0, width ]);

        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // y
        var y = d3.scaleLinear()
            .domain([min, max])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // append tooltip
        d3.select('#scatter-plot-container')
            .append('div')
            .attr('id', 'tooltip')
            .attr('style', 'position: absolute; opacity: 0;')
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px");

        // append dots and add functions
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.Position); } )
            .attr("cy", function (d) { return y(d.Streams); } )
            .attr("r", dotSize)
            .style("fill", "#1DB954")
            .style("stroke", "black")   //After stroke add functions for a tool tip
            .on('mouseover', function(d) {
                d3.select('#tooltip').html("<p>Song Facts:<br>\""+d.Track_Name+
                    "\" by "+d.Artist+"<br>Position #"+d.Position+"<br>Streams: "+d.Streams+"</p>");
                d3.select('#tooltip').transition().duration(200).style('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('opacity', 0);
            })
            .on('mousemove', function() {
                d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px');
            });

        // dynamic title
        svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2) )
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("text-decoration", "underline")
        .text(`Streams vs Top ${filterOption} Position`);

        // text label for the y axis
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left - 4)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("# of Streams");


        if(isSwitched) {
            // new x for animation
            x.domain([0, filterOption])
            svg.select(".x_axis")
                .transition()
                .duration(2000)
                .attr("opacity", "1")
                .call(d3.axisBottom(x));
        }

        //if we havent switched the filter dont reanimate
        else {
            x.domain([0, filterOption])
            svg.select(".x_axis")
                .attr("opacity", "1")
                .call(d3.axisBottom(x));
        }

        //if the curve has been toggled draw it
        if(toggle_curve) {
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#ffae4a")
                .attr("stroke-width", curve_width)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) {
                        return x(d.Position)
                    })
                    .y(function (d) {
                        return y(d.Streams)
                    }));
        }

        if(isSwitched) {
            //animate if we switched the filter
            svg.selectAll("circle")
                .transition()
                .delay(function (d, i) {
                    return (i * 3)
                })
                .duration(2000)
                .attr("cx", function (d) {
                    return x(d.Position);
                })
                .attr("cy", function (d) {
                    return y(d.Streams);
                });
            isSwitched = false
        }

        //if we havent switched the filter dont reanimate
        else {
            svg.selectAll("circle")
                .attr("cx", function (d) {
                    return x(d.Position);
                })
                .attr("cy", function (d) {
                    return y(d.Streams);
                });
        }

    });
}