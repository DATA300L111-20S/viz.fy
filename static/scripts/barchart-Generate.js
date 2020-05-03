document.addEventListener('DOMContentLoaded', function() {
    generateBarChart()
}, false);


function colorByNumber(value, average) {

    if(value > average) {
        return("#ffae4a");
    }

    else {
        return("#1DB954");
    }
}

function generateBarChart() {
   // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 100, left: 100};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // add svg
    var svg = d3.select("#bar_chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


    d3.json("/static/data/top200Histogram.json", function(data) {

        data.forEach(function(d) {
            d.Count = +d.Count;
            d.Position = +d.Position;
        });
        data = data.filter(function(d){return d.Count >= 2});

        var counter = 0;
        var sum = 0;
        var average = 0;

        data.forEach(function(d) {
            d.Count = +d.Count;
            d.Position = +d.Position;
            counter++;
            sum += d.Count;
        });

        average = sum/counter;
        console.log("avg"+average);


        data.sort(function (a,b) {return d3.descending(a.Count, b.Count);});

        // x
        var x = d3.scaleBand()
          .range([ 0, width ])
          .domain(data.map(function(d) { return d.Artist; }))
          .padding(0.2);

        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        //find max
        var max = d3.max(data, function(d) { return d.Count; });

        // y
        var y = d3.scaleLinear()
          .domain([0, max])
          .range([ height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));


        // bars
        var rectBar = svg.selectAll("bar")
          .data(data)
          .enter()
          .append("rect")
            .attr("x", function(d) { return x(d.Artist); })
            .attr("y", function(d) { return y(d.Count); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Count); })
            .attr("fill", function(d) { return colorByNumber(d.Count, average); })
            .attr("rx", 4)
            .attr("ry", 5)

        rectBar.on("click", function(d) {
            window.open(`https://open.spotify.com/track/${d.URL}`);
        });

        svg.append("text")
        .attr("id", "bar_chart_title")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2) )
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(`Top Artists and # of Songs on the Top 200`);
    });
}