define(
    ["common", "dispatch"],

    function (common, dispatch) {

        var ChartNodeLinkView = function (config) {

            var view = null,
                attributes = {
                    selector: null
                },
                width, height,
                force = d3.layout.force()
                    .linkStrength(0.1)
                    .friction(0.9)
                    .distance(400)
                    .gravity(0.05)
                    .charge(-50)
                    .gravity(0.1)
                    .theta(0.8)
                    .alpha(0.1)
                ;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function get(){
                return common.getAttributes(arguments, attributes);
            }

            function setup(){

                view = d3.select(attributes.selector);
                if (!view.empty()){


                }
                else {
                    throw "Unable to find view.";
                }
            }

            function updateScale(data){

                svg = view.select("svg");
                width = parseInt(svg.style("width"), 10);
                svg.attr('height', width);
                height = width;

                force.size([width, height]);
            }

            function updateView(data){

                var nodes, links,
                    linksGroup = svg.select("g.links"),
                    nodesGroup = svg.select("g.nodes");

                if(linksGroup.empty()){
                    linksGroup = svg.append("g").attr("class", "links");
                }

                if(nodesGroup.empty()){
                    nodesGroup = svg.append("g").attr("class", "nodes");
                }

                force.nodes(data.nodeArray).links(data.linkArray).start();

                nodesGroup
                    .selectAll("circle")
                    .data(force.nodes(), data.nodeDomainMap)
                    .enter().append("circle")
                    .attr({
                        "id": function(d, i){
                            return d.id;
                        },
                        "class": function (d, i) {
                            return d.class;
                        },
                        "r": function(d, i){

                            var radius = 1;
                            if(d.duration > 0){
                                radius = d.duration;
                            }

                            return Math.log(parseInt(radius) * 10);
                        },
                        "data-title": function (d, i) {
                            return d.titleFilter;
                        }
                    });

                linksGroup
                    .selectAll("line")
                    .data(force.links(), data.linkDomainMap)
                    .enter().append("line")
                    .attr({
                        "id": function(d, i){
                            return d.lId;
                        },
                        "class": function(d, i){
                            return d.class;
                        },
                        "marker-end": "url(#arrow)"
                    });

                nodes = nodesGroup.selectAll(".node");
                links = linksGroup.selectAll(".link");

                links.data(force.links(), data.linkDomainMap)
                    .style("stroke-width", function (d) {
                        return Math.sqrt((1 / d.rank) * 20);
                        //return (1 / d.weight) * 10;
                    });

                links.data(force.links(), data.linkDomainMap)
                    .exit()
                    .remove();

                force.on("tick", function() {

                    links.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                });
            }

            function highlight(highlights){

                var i, k, hValue, selectResult, property;

                svg.selectAll('line').style({'opacity': 1.0, 'pointer-events': 'auto'});
                svg.selectAll('circle').style({'opacity': 1.0});
                svg.selectAll("circle").style({'stroke': '#fff'});
                
                for(k in highlights) {

                    hValue = highlights[k];

                    switch (k) {

                        case 'selectedNode':

                            if(hValue !== undefined) {

                                svg.selectAll('line:not(.s-' + hValue.id + ')').transition().style({'opacity': 0.1, 'pointer-events': 'none'});
                                svg.selectAll('circle:not(.g-' + hValue.id + ')').transition().style({'opacity': 0.3});
                            }

                            break;

                        case 'title':

                            if(!common.isBlankStr(hValue.value)) {

                                selectResult = svg.selectAll("circle[data-title*='" + hValue.value + "']");
                                selectResult.style({'stroke': 'gold'});
                            }

                            break;

                        case 'property':

                            for(i = 0; i < hValue.properties.length; i++){

                                property = hValue.properties[i];

                                selectResult = d3.selectAll("circle." + hValue.category.prefix + property.name);
                                selectResult.style({fill: property.color});
                            }

                            break;
                    }
                }
            }

            /***** public methods *****/

            this.set = set;
            this.get = get;

            this.updateScale = updateScale;
            this.updateView = updateView;

            this.highlight = highlight;

            this.getView = function(){
                return view;
            };

        };

        return function(config){
            return new ChartNodeLinkView(config);
        };
    }
);