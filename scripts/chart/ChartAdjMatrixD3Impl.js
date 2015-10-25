define(["common", "chart/Chart"], function (common, Chart) {

    //start bar chart
    var ChartAdjMatrix = function (config, parent) {

        var frame,
            svg,
            xScale,
            yScale,
            sep = 0.05,
            data,
            colorDefault = "#f5f5f5",
            typeColorScale = d3.scale.category20(),
            ratingColorScale = d3.scale.category20(),
            otherColorScale = d3.scale.category10(),
            cScale = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7]).range(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]),
            hScale = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7]).range(["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]),
            dScale = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7]).range(["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]);

        //config the object
        set(config);

        //init
        (function init(){

            var exists;

            frame = d3.select(parent.get('selector'));
            exists = !frame.empty();

            parent.set({exists: exists});

            //updateSvg();

        }());

        function updateSvg(){

            if(parent.exists()) {

                svg = frame.select("svg");
                width = parseInt(svg.style("width"), 10);
                svg.attr('height', width);
                height = width;

                parent.set({width: width, height: height});
            }
        }

        function updateScale(dSet){

            var data = parent.get('data'),
                nodeArray0 = data.get('nodes'),
                nodeArray1 = [],
                domainMap = function(d) { return d.id;};

            nodeArray0.sort(function(a, b) {

                if (a.title < b.title) {
                    return 1;
                }
                if (a.title > b.title) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            nodeArray1 = nodeArray0.slice();

            nodeArray1.sort(function(a, b) {

                if (a.title > b.title) {
                    return 1;
                }
                if (a.title < b.title) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });

            xScale = d3.scale.ordinal().domain(nodeArray1.map(domainMap)).rangeBands(parent.get("rangeX"), sep);
            yScale = d3.scale.ordinal().domain(nodeArray0.map(domainMap)).rangeBands(parent.get("rangeY"), sep);
        }

        function display(){

            var data = parent.get('data'),
                nodeArray = data.get('nodes'),
                linkGridArray = data.getLinkGridArray(),
                sLabelsGroup, tLabelsGroup, linksGroup;

            sLabelsGroup = svg.select("g.s-labels");
            tLabelsGroup = svg.select("g.t-labels");
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
                .data(nodeArray, function(d) { return d.id; })
                .enter()
                .append("text")
                .attr({
                    "id": function(d, i) {
                        return "s-" + d.id;
                    },
                    "class": function(d, i) {
                        return d.class;
                    },
                    "x": function(d, i) {
                        return 0;
                    },
                    "y": function (d, i) {
                        return yScale(d.id) + (yScale.rangeBand() /2);
                    },
                    "data-title": function (d, i) {
                        return d.titleFilter;
                    },
                    "textLength":  function (d, i) {
                        return parent.get('padding').left;
                    },
                    "lengthAdjust": "spacing",
                    "font-size": function (d, i) {
                        return Math.log(yScale.rangeBand() * 50);
                    }
                })
                .on('mouseover', function(d, i){
                    updateNodeLabel(d.id, true, true);
                })
                .on('mouseout', function(d, i){
                    updateNodeLabel(d.id, true, false);
                })
                .on('click', function(d, i) {

                    selectNode(d.id);
                })
                .text(function(d) {
                    return d.title;
                });

            tLabelsGroup
                .selectAll("text")
                .data(nodeArray, function(d) { return d.id; })
                .enter()
                .append("text")
                .attr({
                    "id": function(d, i) {
                        return "t-" + d.id;
                    },
                    "class": function(d, i) {
                        return d.class;
                    },
                    "transform": function(d, i) {

                        var x = xScale(d.id) + (xScale.rangeBand() /2),
                            y = parent.get('padding').top;

                        return "translate(" + x + ", " + y + ") rotate(-90)";
                    },
                    "data-title": function (d, i) {
                        return d.titleFilter;
                    },
                    "textLength":  function (d, i) {
                        return parent.get('padding').top;
                    },
                    "lengthAdjust": "spacing",
                    "font-size": function (d, i) {
                        return Math.log(xScale.rangeBand() * 50);
                    }
                })
                .text(function(d) {
                    return d.title;
                });

            linksGroup
                .selectAll("rect")
                .data(linkGridArray, function(d) { return d.id; })
                .enter()
                .append("rect")
                .attr({
                    "id": function(d, i) {
                        return d.id;
                    },
                    "x": function(d, i) {
                        return xScale(d.target.id);
                    },
                    "y": function (d, i) {
                        return yScale(d.source.id);
                    },
                    "class": function(d, i) {
                        return d.class;
                    },
                    "width": xScale.rangeBand(),
                    "height": yScale.rangeBand()
                })
                .on('mouseover', function(d, i){

                    var sId = d.source.id,
                        tId = d.target.id;

                    updateNodeLabel(sId, true, true);
                    updateNodeLabel(tId, false, true);

                    if(d.weight > 0) {
                        changeLinkColor(d.id, true);
                        config.app.changeSelectedLinkColor(d.id, true);
                    }
                })
                .on('mouseout', function(d, i){

                    var sId = d.source.id,
                        tId = d.target.id;

                    updateNodeLabel(sId, true, false);
                    updateNodeLabel(tId, false, false);

                    if(d.weight > 0) {
                        changeLinkColor(d.id, false);
                        config.app.changeSelectedLinkColor(d.id, false);
                    }
                })
                .on('click', function(d, i){

                    var link;

                    selectNode(d.source.id);

                    if(d.source.id !== d.target.id && !data.isConnected(d.source.id, d.target.id)){

                        if(!data.hasMaxLinks(d.source.id)) {

                            link = data.makeLink(d.source.id, d.target.id);
                            //d3.select(this).attr({fill: cScale(link.weight)});
                            config.app.selectNode(d.source.id);
                            display();

                        }
                        else {

                            config.app.showDangerMsg("You have reached the maximum number of connections for this video.");
                        }
                    }
                })
                .append("title")
                .text(function(d) {
                    return d.source.title + " :: " + d.target.title + " :: " + d.weight;
                });

            linksGroup
                .selectAll("rect")
                .data(linkGridArray, function(d) { return d.id; })
                .attr({
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
                    return d.source.title + " :: " + d.target.title + " :: " + d.weight;
                });
        }

        function selectNode(nId){

            svg.selectAll("text.node").style({'font-weight': 'normal'});
            updateNodeLabel(nId, true, true);
            config.app.selectNode(nId);
        }

        function updateNodeLabel(nId, isSource, doHighlight){

            var id = '#' + ((isSource)? 's-' : 't-') + nId;

            if(doHighlight){
                svg.select(id).style({'font-weight': '900'});
            }
            else {

                if(config.app.getSelectedNodeId() !== nId){
                    svg.select(id).style({'font-weight': 'normal'});
                }
            }
        }

        this.display = function(){

            updateSvg();
            updateScale();
            display();
        };

        function hightLight(hArray, colorScale){

            var k, h,
                typeColorArray = [];

            for(k in hArray){

                h = hArray[k];
                c = colorScale(h.id);

                d3.selectAll("text." + h.id).style({fill: c});

                typeColorArray.push({
                    name: h.name,
                    color: c
                });
            }

            return typeColorArray;
        }

        this.highlight = function(type){

            var typeColorArray = null,
                data = parent.get('data');

            switch(type){

                case 'type':
                    typeColorArray = hightLight(data.get('typeAttrMap'), typeColorScale);
                    break;
                case 'status':
                    typeColorArray = hightLight(data.get('statusAttrMap'), otherColorScale);
                    break;
                case 'rating':
                    typeColorArray = hightLight(data.get('ratingAttrMap'), ratingColorScale);
                    break;
                case 'match':
                    typeColorArray = hightLight(data.get('matchAttrMap'), otherColorScale);
                    break;
                case 'restriction':
                    typeColorArray = hightLight(data.get('ageGateAttrMap'), otherColorScale);
                    break;
                case 'title-type':
                    typeColorArray = hightLight(data.get('titleTypeAttrMap'), otherColorScale);
                    break;
            }

            return typeColorArray;
        };

        this.breakLink = function(lId){

            var link,
                data = parent.get('data');

            link = data.removeLink(lId);

            display();
        };

        this.adjustLinkWeight = function(sNodeId, startIndex, endIndex){

            var data = parent.get('data');
            data.adjustLinkWeight(sNodeId, startIndex, endIndex);

            display();
        };

        function changeLinkColor(lId, doHighlight){

            var f = colorDefault,
                data = parent.get('data'),
                linkMap = data.get('linkMap'),
                link = linkMap[lId];

            if(link.weight > 0){

                if(doHighlight){
                    f = hScale(link.weight);
                }
                else {
                    f = cScale(link.weight);
                }
            }

            svg.select('#' + lId).attr({fill: f});
        }

        this.changeLinkColor = function(lId, doHighlight){
            changeLinkColor(lId, doHighlight);
        };

        this.filterNode = function(value){

            svg.selectAll("text").style({'opacity': 1.0});

            if(value !== ""){
                svg.selectAll("text:not([data-title*='" + value + "'])").transition().style({'opacity': 0.2});
            }
        };

        this.clear = function(){

            svg.selectAll("*").remove();
        };

        function set(config) {

            if (!common.isUndefined(config)) {
            }
        }

        function get(key){

            var value = null;

            return value;
        }

        //public setter
        this.set = function(config){

            parent.set(config);

            set(config);
        };

        //public getter
        this.get = function(key){

            var value = get(key);

            if(value === null){
                value = parent.get(key);
            }

            return value;
        };

    };

    return {

        getInstance: function(config) {
            var parent = Chart.getInstance(config);
            ChartAdjMatrix.prototype = parent;
            return new ChartAdjMatrix(config, parent);
        }
    };
});