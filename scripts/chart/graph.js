require(["d3"],
    function(d3) {

        var chart = d3.select(".chart"),
            svg = chart.select("svg"),
            width = parseInt(svg.style("width"), 10),
            height = parseInt(svg.style("height"), 10),
            force = d3.layout.force()
                .linkStrength(0.1)
                .friction(0.9)
                .distance(400)
                .gravity(0.05)
                .charge(-50)
                .gravity(0.1)
                .theta(0.8)
                .alpha(0.1)
                .size([width, height]);

        d3.json("/hci_prototype/data/graph_speed.json", function(error, graph) {

            var node,
                link;

            if (error) throw error;

            force.nodes(graph.nodes).links(graph.links).start();

            link = svg.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function (d) {
                    return Math.log(d.weight);
                });

            node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("id", function(d, i){
                    return "v-" + d.id;
                })
                .attr("class", function(d, i){

                    return "node type-" + d.type + " match-" + d.isMatch;
                })
                .attr("r", function(d, i){

                    var weight = 1;
                    if(d.duration > 0){
                        weight = d.duration;
                    }

                    return Math.log(parseInt(weight)* 100);
                });

            node.append("title")
                .text(function (d) {
                    return d.title;
                });

            force.on("tick", function() {

                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        });
    }
);