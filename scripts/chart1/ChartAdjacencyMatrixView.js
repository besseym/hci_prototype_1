define(
    ["common", "courier", "chart1/ChartView"],

    function (common, courier, ChartView) {

        var ChartAdjacencyMatrixView = function (config, parent) {

            var frame = null,
                svg = null,
                xScale, yScale, sep = 0.05,
                colorDefault = "#f5f5f5",
                cScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]),
                attributes = {
                    tranistionTime: 1000
                },
                domainMap = function(d){
                    return d.id;
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function get(){
                return common.getAttributes(arguments, attributes);
            }

            function setup(){

                var exists = false, width, height;

                frame = d3.select(parent.get("selector"));
                exists = !frame.empty();

                parent.set({exists: exists});

                if (exists){
                    svg = frame.select("svg");

                    width = parseInt(svg.style("width"), 10);
                    svg.attr('height', width);
                    height = width;

                    parent.set({width: width, height: height});
                }
                else {
                    throw "Unable to find container.";
                }
            }

            function updateScale(data){

                var width = parseInt(svg.style("width"), 10),
                    height = width,
                    paddingLeft = width / 4,
                    paddingTop = width / 4,
                    paddingRight = width / 10;

                svg.attr('height', height);

                parent.set(
                    {
                        width: width, height: height,
                        paddingLeft: paddingLeft, paddingTop: paddingTop, paddingRight: paddingRight
                    }
                );

                xScale = d3.scale.ordinal().domain(data.tNodeArray.map(domainMap)).rangeBands(parent.get('rangeX'), sep);
                yScale = d3.scale.ordinal().domain(data.sNodeArrayDesc.map(domainMap)).rangeBands(parent.get('rangeY'), sep);
            }

            function updateView(data){

                var sLabelsGroup = svg.select("g.s-labels"),
                    tLabelsGroup = svg.select("g.t-labels"),
                    linksGroup = svg.select("g.links");

                if(sLabelsGroup.empty()){
                    sLabelsGroup = svg.append("g").attr("class", "s-labels");
                }

                if(tLabelsGroup.empty()){
                    tLabelsGroup = svg.append("g").attr("class", "t-labels");
                }

                if(linksGroup.empty()){
                    linksGroup = svg.append("g").attr("class", "links");
                }

                sLabelsGroup
                    .selectAll("text")
                    .data(data.sNodeArray, domainMap)
                    .enter()
                    .append("text")
                    .attr({
                        "id": function(d, i) {
                            return "s-" + d.id;
                        },
                        "class": function(d, i) {
                            return d.class;
                        },
                        "text-anchor": "end",
                        "data-title": function (d, i) {
                            return d.titleFilter;
                        }
                    })
                    .on('click', function(d, i) {

                        courier.publish("view_select_node", {
                            nId: d.nId
                        });
                    })
                    .text(function(d) {
                        return d.title;
                    });

                sLabelsGroup
                    .selectAll("text")
                    .data(data.sNodeArray, domainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        "x": function(d, i) {
                            return parent.get('paddingLeft');
                        },
                        "y": function (d, i) {
                            return yScale(d.id) + (yScale.rangeBand() /2);
                        },
                        //"textLength":  function (d, i) {
                        //    return parent.get('padding').left;
                        //},
                        //"lengthAdjust": "spacing",
                        "font-size": function (d, i) {
                            return Math.sqrt(yScale.rangeBand() * 2);
                        },
                        "dy": function (d, i) {
                            return (Math.sqrt(yScale.rangeBand() * 2) * 0.5);
                        }
                    });

                sLabelsGroup
                    .selectAll("text")
                    .data(data.sNodeArray, domainMap)
                    .exit()
                    .remove();

                tLabelsGroup
                    .selectAll("text")
                    .data(data.tNodeArray, domainMap)
                    .enter()
                    .append("text")
                    .attr({
                        "id": function(d, i) {
                            return "t-" + d.id;
                        },
                        "class": function(d, i) {
                            return d.class;
                        },
                        "data-title": function (d, i) {
                            return d.titleFilter;
                        }
                    })
                    .text(function(d) {
                        return d.title;
                    });

                tLabelsGroup
                    .selectAll("text")
                    .data(data.tNodeArray, domainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        "transform": function(d, i) {

                            var x = xScale(d.id) + (xScale.rangeBand() /2),
                                y = parent.get('paddingTop');

                            return "translate(" + x + ", " + y + ") rotate(-35)";
                        },
                        //"textLength":  function (d, i) {
                        //    return parent.get('padding').top;
                        //},
                        //"lengthAdjust": "spacing",
                        "font-size": function (d, i) {
                            return Math.sqrt(xScale.rangeBand() * 2);
                        },
                        "dx": function (d, i) {
                            return (Math.sqrt(xScale.rangeBand() * 2) * 0.5);
                        }
                    });

                tLabelsGroup
                    .selectAll("text")
                    .data(data.tNodeArray, domainMap)
                    .exit()
                    .remove();

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .enter()
                    .append("rect")
                    .attr({
                        "id": function(d, i) {
                            return d.lId;
                        },
                        "class": function(d, i) {
                            return d.class;
                        }
                    })
                    .on('click', function(d, i) {

                        courier.publish("view_update_link", {
                            sId: d.source.id,
                            tId: d.target.id
                        });
                    })
                    .append("title")
                    .text(function(d) {
                        return d.source.title + " :: " + d.target.title + " :: " + d.weight;
                    });

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        "x": function(d, i) {
                            return xScale(d.target.id);
                        },
                        "y": function (d, i) {
                            return yScale(d.source.id);
                        },
                        "width": xScale.rangeBand(),
                        "height": yScale.rangeBand(),
                        fill: function(d) {

                            var f = colorDefault;
                            if(d.source.id === d.target.id){
                                f = "#d5d5d5";
                            }
                            else if(d.weight > 0){
                                f = cScale(d.weight);
                            }

                            return f;
                        }
                    })
                    .select("title")
                    .text(function(d) {
                        return d.source.title + " -- " + d.target.title + " -- " + d.weight;
                    });

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .exit()
                    .remove();
            }

            function highlight(highlights){

                var k, highlightValue, selectResult, count;

                selectResult = svg.selectAll("text");
                selectResult.style({'opacity': 1.0});

                for(k in highlights) {

                    highlightValue = highlights[k];
                    if(common.isBlankStr(highlightValue)){
                        continue;
                    }

                    switch (k) {

                        case 'title':

                            selectResult = svg.selectAll("text:not([data-title*='" + highlightValue + "'])");
                            selectResult.transition().style({'opacity': 0.2});
                            //highlight.count = data.getNodeCount() - (selectResult[0].length * 0.5);

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

        };

        return function(config){

            var parent = new ChartView(config);
            ChartAdjacencyMatrixView.prototype = parent;
            ChartAdjacencyMatrixView.prototype.constructor = ChartAdjacencyMatrixView;
            return new ChartAdjacencyMatrixView(config, parent);
        };
    }
);