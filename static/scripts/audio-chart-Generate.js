    document.addEventListener('DOMContentLoaded', function() {
        generateAudioChart(200, 4);
    }, false);

function generateAudioChart() {
    var globalCycle = 1;
    var globalFeature = ["NULL", "acousticness", "danceability", "energy", "liveness", "speechiness", "valence"]

    var margin = {top: 20, right: 30, bottom: 40, left: 50};
    var width = 960 - margin.left - margin.right;
    var height = 520 - margin.top - margin.bottom;

    var svg = d3.select("#audio_chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")")

//Read the data
d3.json("/static/data/top200TracksD3.json", function(data) {

    //preprocessing
    var position = [];
    var acousticness = [];
    var valence = [];
    var danceability = [];
    var energy = [];
    var liveness = [];
    var speechiness = [];

    data.forEach(function (d) {
        d.acousticness = +d.acousticness;
        acousticness.push(d.acousticness);

        d.valence = +d.valence;
        valence.push(d.valence);

        d.danceability = +d.danceability;
        danceability.push(d.danceability);

        d.energy = +d.energy;
        energy.push(d.energy);

        d.liveness = +d.liveness;
        liveness.push(d.liveness);

        d.speechiness = +d.speechiness;
        speechiness.push(d.speechiness);

        d.Position = +d.Position;
        position.push(d.Position);

    }); //Convert things to numbers...because they're numbers...

    // x
    var x = d3.scaleLinear()
        .domain([0, 200])
        .range([0, width])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))
        .select(".domain").remove()

    //y
    var y = d3.scaleLinear()
        .domain([-0.001, 1])
        .range([height, 0])
        .nice()
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width * 1.3).ticks(7))
        .select(".domain").remove()

    // background
    svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

    // x label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text("Position");

    // y label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Audio Feature Value")

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return x(d.Position);
        })
        .attr("cy", function (d) {
            return y(d.acousticness);
        })
        .attr("r", 5)
        .style("fill", "#1DB954")

    var lsr = findLineByLeastSquares(position, acousticness);
    svg.append("line")
        .attr("id", "lsr-line")
        .attr("class", "regression")
        .attr("x1", x(lsr[0][0]))
        .attr("y1", y(lsr[1][0]))
        .attr("x2", x(lsr[0][199]))
        .attr("y2", y(lsr[1][199]))
        .style("stroke", "#ffae4a")
        .style("fill", "#ffae4a")
        .style("stroke-width", 2)
        .style("stroke-dasharray", ("3, 3"));

    svg.append("text")
        .attr("id", "audio_feature_title")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2) )
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(`${globalFeature[globalCycle]}`);

// =====================================================================================================================
    d3.select('#cycle-btn').on('click', function (d) {

        if(globalCycle<6) {
            globalCycle++;
        }
        else {
            globalCycle = 1;
        }

        console.log(globalCycle);

        svg.selectAll("#audio_feature_title")
            .transition()
            .duration(750)
            .style("opacity", "0");


        svg.selectAll("#audio_feature_title")
            .transition()
            .delay(750)
            .duration(750)
            .style("opacity", "1")
            .text(`${globalFeature[globalCycle]}`);

        svg.selectAll("circle")
            .data(data)
            .transition()
            .delay(function (d, i) {
                return i * 40;
            })
            .attr("cx", function (d) {
                return x(d.Position);
            })
            .attr("cy", function (d) {
                switch(globalCycle) {
                    case 1:
                        lsr = findLineByLeastSquares(position, acousticness);
                        return y(d.acousticness);
                        break;
                    case 2:
                        lsr = findLineByLeastSquares(position, danceability);
                        return y(d.danceability);
                        break;
                    case 3:
                        lsr = findLineByLeastSquares(position, energy);
                        return y(d.energy);
                        break;
                    case 4:
                        lsr = findLineByLeastSquares(position, liveness);
                        return y(d.liveness);
                        break;
                    case 5:
                        lsr = findLineByLeastSquares(position, speechiness);
                        return y(d.speechiness);
                        break;
                    case 6:
                        lsr = findLineByLeastSquares(position, valence);
                        return y(d.valence)
                }
                return y(d.danceability);
            });

        svg.select("#lsr-line")
            .transition()
            .duration(10)
            .style("opacity", "0");

        svg.select("#lsr-line")
            .attr("class", "regression")
            .attr("x1", x(lsr[0][0]))
            .attr("y1", y(lsr[1][0]))
            .attr("x2", x(lsr[0][199]))
            .attr("y2", y(lsr[1][199]))
            .style("stroke", "#ffae4a")
            .style("fill", "#ffae4a")
            .style("stroke-width", 2)
            .style("stroke-dasharray", ("3, 3"))
            .transition()
            .delay(750)
            .duration(750)
            .style("opacity", "1")

        });

    });

}

//found a least squares calculator online
function findLineByLeastSquares(values_x, values_y) {
    var x_sum = 0;
    var y_sum = 0;
    var xy_sum = 0;
    var xx_sum = 0;
    var count = 0;

    /*
     * The above is just for quick access, makes the program faster
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Above and below cover edge cases
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (let i = 0; i< values_length; i++) {
        x = values_x[i];
        y = values_y[i];
        x_sum+= x;
        y_sum+= y;
        xx_sum += x*x;
        xy_sum += x*y;
        count++;
    }

    var m = (count*xy_sum - x_sum*y_sum) / (count*xx_sum - x_sum*x_sum);
    var b = (y_sum/count) - (m*x_sum)/count;

    /*
     * We then return the x and y data points according to our fit
     */
    var result_values_x = [];
    var result_values_y = [];

    for (let i = 0; i < values_length; i++) {
        x = values_x[i];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}



