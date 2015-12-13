define(
    ["common", "dispatch", "chart1/ChartView"],

    function (common, dispatch, ChartView) {

        var ChartAdjacencyMatrixView = function (config, parent) {

            var frame = null,
                svg = null,
                xScale, yScale, sep = 0.05,
                colorDefault = "#f5f5f5",
                cScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]),
                hScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]),
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

                        dispatch.publish("view_select_node", {
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

                        dispatch.publish("view_update_link", {
                            sId: d.source.id,
                            sNodeId: d.source.nId,
                            tId: d.target.id,
                            tNodeId: d.target.nId
                        });
                    })
                    .on('mouseover', function(d, i) {

                        var sId = d.source.id,
                            tId = d.target.id;

                        highlightNode(sId, true, true);
                        highlightNode(tId, false, true);

                        highlightLink(d, true);

                        dispatch.publish("view_chart_mouseover_link", {
                            lId: d.lId
                        });
                    })
                    .on('mouseout', function(d, i) {

                        var sId = d.source.id,
                            tId = d.target.id;

                        highlightNode(sId, true, false);
                        highlightNode(tId, false, false);

                        highlightLink(d, false);

                        dispatch.publish("view_chart_mouseout_link", {
                            lId: d.lId
                        });
                    })
                    .append("title")
                    .text(function(d) {
                        return d.source.title + " :: " + d.target.title + " :: " + d.rank;
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
                            else if(d.rank > 0){
                                f = cScale(d.rank);
                            }

                            return f;
                        }
                    })
                    .select("title")
                    .text(function(d) {
                        return d.source.title + " -- " + d.target.title + " -- " + d.rank;
                    });

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .exit()
                    .remove();
            }

            function highlight(highlights){

                var i, k, hValue, selectResult, property;

                selectResult = svg.selectAll("text");
                selectResult.style({'opacity': 1.0});

                for(k in highlights) {

                    hValue = highlights[k];

                    switch (k) {

                        case 'title':

                            if(!common.isBlankStr(hValue.value)) {

                                selectResult = svg.selectAll("text:not([data-title*='" + hValue.value + "'])");
                                selectResult.transition().style({'opacity': 0.2});
                            }

                            break;

                        case 'property':

                            for(i = 0; i < hValue.properties.length; i++){

                                property = hValue.properties[i];

                                selectResult = d3.selectAll("text." + hValue.category.prefix + property.name);
                                selectResult.style({fill: property.color});
                            }

                            break;
                    }
                }
            }

            function highlightLink(link, doHighlight){

                var f = colorDefault;
                if(link.rank > 0){

                    if(doHighlight){
                        f = hScale(link.rank);
                    }
                    else {
                        f = cScale(link.rank);
                    }
                }

                svg.select('#' + link.lId).attr({fill: f});
            }

            function highlightNode(nId, isSource, doHighlight){

                var id = '#' + ((isSource)? 's-' : 't-') + nId;

                if(doHighlight){

                    svg.select(id).style({'font-weight': '900'});
                }
                else {

                    svg.select(id).style({'font-weight': 'normal'});
                }
            }

            /***** public methods *****/

            this.set = set;
            this.get = get;

            this.updateScale = updateScale;
            this.updateView = updateView;

            this.highlight = highlight;
            this.highlightLink = highlightLink;

        };

        return function(config){

            var parent = new ChartView(config);
            ChartAdjacencyMatrixView.prototype = parent;
            ChartAdjacencyMatrixView.prototype.constructor = ChartAdjacencyMatrixView;
            return new ChartAdjacencyMatrixView(config, parent);
        };
    }
);