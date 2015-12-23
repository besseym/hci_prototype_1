define(
    ["common", "dispatch", "chart/ChartView"],

    function (common, dispatch, ChartView) {

        var ChartAdjacencyMatrixView = function (config, parent) {

            var frame = null,
                svg = null,
                xScale, yScale, sep = 0.05,
                colorDefault = "#f5f5f5",
                cScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(colorbrewer.PuBu[7]),
                hScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(colorbrewer.PuRd[7]),
                mScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(colorbrewer.BuGn[7]),
                attributes = {
                    tranistionTime: 1000
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

            function calculateFontSize (d, i, band) {

                var fontSize = (band * 0.5);

                if(fontSize > 14){
                    fontSize = 14;
                }

                return fontSize;
            }

            function updateDimensions(){

                var width = parseInt(svg.style("width"), 10),
                    height = width,
                    //unit = (width / data.tNodeArray.length),
                    paddingLeft = width * 0.3,
                    paddingTop = paddingLeft,
                    paddingRight = width * 0.05,
                    paddingBottom = paddingRight;

                svg.attr('height', height);

                if((width - paddingRight) > paddingLeft) {
                    parent.set(
                        {
                            width: width,
                            height: height,
                            paddingLeft: paddingLeft,
                            paddingTop: paddingTop,
                            paddingRight: paddingRight,
                            paddingBottom: paddingBottom
                        }
                    );
                }
            }

            function updateScale(data){

                updateDimensions(data);

                xScale = d3.scale.ordinal().domain(data.tNodeArray.map(data.nodeDomainMap)).rangeBands(parent.get('rangeX'), sep);
                yScale = d3.scale.ordinal().domain(data.sNodeArrayDesc.map(data.nodeDomainMap)).rangeBands(parent.get('rangeY'), sep);
            }

            function updateView(data){

                dispatch.publish("view_loading_show", {});

                //delay long enough for the ui to update
                setTimeout(function(){

                    doUpdateView(data);

                    dispatch.publish("view_loading_hide", {});

                }, 0);
            }

            function doUpdateView(data){

                var rangeX = parent.get('rangeX'),
                    dWidth = rangeX[1] - rangeX[0],
                    hWidth = dWidth * 0.5,
                    midX = rangeX[0] + hWidth,
                    rangeY = parent.get('rangeY'),
                    dHeight = rangeY[0] - rangeY[1],
                    hHeight = dHeight * 0.5,
                    midY = rangeY[1] + hHeight,
                    sLabelsGroup = svg.select("g.s-labels"),
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
                    .data(data.sNodeArray, data.nodeDomainMap)
                    .enter()
                    .append("text")
                    .attr({
                        "id": function(d, i) {
                            return "s-" + d.id;
                        },
                        "x": function (d, i) {
                            return 0;
                        },
                        "y": function (d, i) {

                            var y = yScale(d.id);
                            if(y <= midY){
                                y = rangeY[1] - y;
                            }
                            else {
                                y = rangeY[0] + y;
                            }

                            return y;
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
                    .on('mouseover', function(d, i) {

                        highlightNode(d.id, true, true);
                    })
                    .on('mouseout', function(d, i) {

                        highlightNode(d.id, true, false);
                    })
                    .text(function(d) {
                        return d.title;
                    });

                sLabelsGroup
                    .selectAll("text")
                    .data(data.sNodeArray, data.nodeDomainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        "x": function(d, i) {
                            return parent.get('paddingLeft');
                        },
                        "y": function (d, i) {
                            return yScale(d.id) + (yScale.rangeBand() * 0.5);
                        },
                        //"textLength":  function (d, i) {
                        //    return parent.get('padding').left;
                        //},
                        //"lengthAdjust": "spacing",
                        "font-size": function(d, i) {
                            return calculateFontSize(d, i, yScale.rangeBand());
                        },
                        "dy": function (d, i) {
                            return (calculateFontSize(d, i, yScale.rangeBand()) * 0.5);
                        }
                    });

                sLabelsGroup
                    .selectAll("text")
                    .data(data.sNodeArray, data.nodeDomainMap)
                    .exit()
                    .remove();

                tLabelsGroup
                    .selectAll("text")
                    .data(data.tNodeArray, data.nodeDomainMap)
                    .enter()
                    .append("text")
                    .attr({
                        "id": function(d, i) {
                            return "t-" + d.id;
                        },
                        "transform": function(d, i) {

                            var x = xScale(d.id), y = 0;

                            if(x <= midX){
                                x = rangeX[0] - x;
                            }
                            else {
                                x = rangeX[1] + x;
                            }

                            return "translate(" + x + ", " + y + ") rotate(-35)";
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
                    .data(data.tNodeArray, data.nodeDomainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        //"x": function(d, i) {
                        //    return xScale(d.id) + (xScale.rangeBand() * 0.5);
                        //},
                        //"y": function (d, i) {
                        //    return parent.get('paddingTop');
                        //},
                        "transform": function(d, i) {

                            var x = xScale(d.id) + (xScale.rangeBand() /2),
                                y = parent.get('paddingTop');

                            return "translate(" + x + ", " + y + ") rotate(-35)";
                        },
                        //"textLength":  function (d, i) {
                        //    return parent.get('padding').top;
                        //},
                        //"lengthAdjust": "spacing",
                        "font-size": function(d, i) {
                            return calculateFontSize(d, i, xScale.rangeBand());
                        },
                        "dx": function (d, i) {
                            return (calculateFontSize(d, i, xScale.rangeBand()) * 0.5);
                        }
                    });

                tLabelsGroup
                    .selectAll("text")
                    .data(data.tNodeArray, data.nodeDomainMap)
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
                        },
                        "x": function (d, i) {

                            var x = xScale(d.target.id);
                            if(x <= midX){
                                x = rangeX[0] - x;
                            }
                            else {
                                x = rangeX[1] + x;
                            }

                            return x;
                        },
                        "y": function (d, i) {

                            var y = yScale(d.source.id);
                            if(y <= midY){
                                y = rangeY[1] - y;
                            }
                            else {
                                y = rangeY[0] + y;
                            }

                            return y;
                        },
                        "width": xScale.rangeBand(),
                        "height": yScale.rangeBand()
                    });

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .transition().duration(attributes.tranistionTime)
                    .attr({
                        "x": function (d, i) {
                            return xScale(d.target.id);
                        },
                        "y": function (d, i) {
                            return yScale(d.source.id);
                        },
                        "width": xScale.rangeBand(),
                        "height": yScale.rangeBand()
                    });

                linksGroup
                    .selectAll("rect")
                    .data(data.linkGridArray, data.linkDomainMap)
                    .attr({
                        fill: function(d) {

                            return getLinkColor(d);
                        }
                    })
                    .on('click', function(d, i) {

                        dispatch.publish("view_update_link", {
                            sId: d.source.id,
                            tId: d.target.id
                        });
                    })
                    .on('mouseover', function(d, i) {

                        var sId = d.source.id,
                            tId = d.target.id,
                            location = {
                                x: xScale(d.target.id) + (xScale.rangeBand() * 0.25),
                                y: yScale(d.source.id) + (yScale.rangeBand() * 0.75)
                            };

                        highlightNode(sId, true, true);
                        highlightNode(tId, false, true);

                        highlightLink(d, true);

                        dispatch.publish("view_chart_mouseover_link", {

                            lId: d.lId,
                            sNodeId: d.source.nId,
                            tNodeId: d.target.nId,
                            withKey: d3.event.shiftKey,
                            location: location
                        });
                    })
                    .on('mouseout', function(d, i) {

                        var sId = d.source.id,
                            tId = d.target.id;

                        highlightNode(sId, true, false);
                        highlightNode(tId, false, false);

                        highlightLink(d, false);

                        dispatch.publish("view_chart_mouseout_link", {
                            lId: d.lId,
                            withKey: d3.event.shiftKey
                        });
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
                selectResult.style({'opacity': 1.0, 'font-weight': 'normal'});

                for(k in highlights) {

                    hValue = highlights[k];

                    switch (k) {

                        case 'selectedNode':

                            if(hValue !== undefined) {

                                selectResult = svg.selectAll("#s-" + hValue.id);
                                selectResult.style({'font-weight': 900});
                            }

                            break;

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

            function getLinkColor(link, doHighlight){

                var f = colorDefault;
                if(link.source.id === link.target.id){
                    f = "#d5d5d5";
                }
                else if(link.rank > 0){

                    if(doHighlight !== undefined & doHighlight) {
                        f = hScale(link.rank);
                    }
                    else {
                        if(!link.isManual) {
                            f = cScale(link.rank);
                        }
                        else {
                            f = mScale(link.rank);
                        }
                    }
                }

                return f;
            }

            function highlightLink(link, doHighlight){

                var f = colorDefault;
                if(link.source.id !== link.target.id){

                    f = getLinkColor(link, doHighlight);
                    svg.select('#' + link.lId).attr({fill: f});
                }
            }

            function highlightNode(nId, isSource, doHighlight){

                var id = '#' + ((isSource)? 's-' : 't-') + nId;

                if(doHighlight){

                    svg.select(id).style({'text-decoration': 'underline'});
                }
                else {

                    svg.select(id).style({'text-decoration': 'none'});
                }
            }

            /***** public methods *****/

            this.set = set;
            this.get = function(){

                var rtn = get.apply(this, arguments);

                if(rtn === undefined){
                    rtn = parent.get.apply(parent, arguments);
                }

                return rtn;
            };

            this.updateDimensions = updateDimensions;
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