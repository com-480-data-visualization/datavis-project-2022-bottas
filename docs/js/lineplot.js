let svg_line = d3.select("#lineplot").append("svg").attr("width", 700).attr("height", 300)

let y_scale = d3.scaleLinear().domain([10,7]).range([50,250]);
let y_axis = d3.axisRight()
.scale(y_scale);
svg_line.append("g").attr("transform", "translate(50, 0)").call(y_axis);

let x_scale = d3.scaleTime().domain([new Date(2015, 8, 1), new Date(2017, 8, 31)])
.range([50, 650]);
let x_axis = d3.axisBottom().scale(x_scale);
svg_line.append("g").attr("transform", "translate(0, 250)").attr("fill", "black").call(x_axis);

//svg_line.append("line").style("stroke", "black")
//.style("stroke-width", 1.5)
//.attr("x1", 50)
//.attr("y1", 100)
//.attr("x2", 650)
//.attr("y2", 100);

function update_line(city){
    svg_line.selectAll("path").remove();
    var lineplot_points = [];

    d3.csv('lineplots/avg_scores_whole.csv').then(function(data){
        for (const entry of data) {
            if (entry['Type'] == city) {
                date = new Date(parseInt(entry['Review_Year']), parseInt(entry['Review_Month']), 15);
                lineplot_points.push([date, parseFloat(entry['Reviewer_Score'])]);   
            }
        }
        svg_line.append("path")
                .datum(lineplot_points)
                .style("fill", "none")
                .style("stroke", "black")
                .style("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x_scale(d[0]) })
                    .y(function(d) { return y_scale(d[1]) })
            );
    });
    current_lineplot_city = city;
}

//update_line("whole");


var start_date = new Date(2015, 8, 1);
var end_date = new Date(2017, 8, 31);

svg_line.append("rectangle").attr("width", 700).attr("height", 300)
.attr("style", "fill:rgb(255,255,255);stroke-width:3;stroke:rgb(0,0,0)");

const brush = d3.brushX()
.extent([[50, 50], [650, 250]]);


brush.on("end", brushended);

svg_line.append("g").call(brush).call(brush.move, [50, 650]);

function brushended(event) {
    const selection = event.selection;
    if (!event.sourceEvent || !selection) return;
    let start_coord = selection[0];
    let end_coord = selection[1];
    let start = x_scale.invert(start_coord);
    let end = x_scale.invert(end_coord);
    start.setDate(1);
    end = new Date(end.getFullYear(), end.getMonth()+1, 0);

    start_date = start;
    end_date = end;

    d3.select(this).call(brush.move, [start_date,end_date].map(x_scale));
}
