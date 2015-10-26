define(["common", "chart/Chart"], function (common, Chart) {

    //start bar chart
    var ChartAdjMatrix = function (config, parent) {

        var frame,
            svg,
            xScale,
            yScale,
            sep = 0.05,
            data,
            arrowKeys = {left: 65, up: 87, right: 68, down: 83, zoom: 90, expand: 88},
            //arrowKeys = {left: 37, up: 38, right: 39, down: 40, zoom: 187, expand: 189},
            zRate = 3,
            xRate = 3,
            mRate = 3,
            sStart = 0, sEnd, tStart = 0, tEnd,
            colorDefault = "#f5f5f5",
            typeColorScale = d3.scale.category20(),
            ratingColorScale = d3.scale.category20(),
            otherColorScale = d3.scale.category10(),
            cScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]),
            hScale = d3.scale.ordinal().domain([7, 6, 5, 4, 3, 2, 1]).range(["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]),
            dScale = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7]).range(["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"]);

        //config the object
        set(config);

        //init
        (function init(){

            var exists;

            frame = d3.select(parent.get('selector'));
            exists = !frame.empty();

            parent.set({exists: exists});

            if(exists){
                svg = frame.select("svg");
            }

            //updateSvg();

        }());

        function updateSvg(){

            var data = parent.get('data'), width, height, padding;

            if(parent.exists()) {

                width = parseInt(svg.style("width"), 10);
                svg.attr('height', width);
                height = width;

                parent.set({width: width, height: height});

                padding = Math.sqrt((width / data.get('nodes').length)) * 38;
                parent.set({pTop: padding, pLeft: padding});
            }
        }

        function updateScale(){

            var data = parent.get('data'),
                sNodeArray = data.getSortedNodeArray(sStart, sEnd, true),
                tNodeArray = data.getSortedNodeArray(tStart, tEnd),
                domainMap = function(d) { return d.id; };

            xScale = d3.scale.ordinal().domain(tNodeArray.map(domainMap)).rangeBands(parent.get("rangeX"), sep);
            yScale = d3.scale.ordinal().domain(sNodeArray.map(domainMap)).rangeBands(parent.get("rangeY"), sep);
        }

        function display(){

            var data = parent.get('data'),
                sNodeArray = data.getSortedNodeArray(sStart, sEnd),
                tNodeArray = data.getSortedNodeArray(tStart, tEnd),
                linkGridArray = data.getLinkGridArray(sStart, sEnd, tStart, tEnd),
                sLabelsGroup, tLabelsGroup, linksGroup,
                tranistionTime = 1000;

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
                .data(sNodeArray, function(d) { return d.id; })
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

            sLabelsGroup
                .selectAll("text")
                .data(sNodeArray, function(d) { return d.id; })
                .transition().duration(tranistionTime)
                .attr({
                    "x": function(d, i) {
                        return parent.get('padding').left;
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
                .data(sNodeArray, function(d) { return d.id; })
                .exit()
                .remove();

            tLabelsGroup
                .selectAll("text")
                .data(tNodeArray, function(d) { return d.id; })
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
                .data(tNodeArray, function(d) { return d.id; })
                .transition().duration(tranistionTime)
                .attr({
                    "transform": function(d, i) {

                        var x = xScale(d.id) + (xScale.rangeBand() /2),
                            y = parent.get('padding').top;

                        return "translate(" + x + ", " + y + ") rotate(-90)";
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
                .data(tNodeArray, function(d) { return d.id; })
                .exit()
                .remove();

            linksGroup
                .selectAll("rect")
                .data(linkGridArray, function(d) { return d.id; })
                .enter()
                .append("rect")
                .attr({
                    "id": function(d, i) {
                        return d.id;
                    },
                    "class": function(d, i) {
                        return d.class;
                    }
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

                    if(d.source.id !== d.target.id){

                        if(!data.isConnected(d.source.id, d.target.id)){

                            if(!data.hasMaxLinks(d.source.id)) {

                                config.app.makeLink(d.source.id, d.target.id);

                                link = data.makeLink(d.source.id, d.target.id);
                                config.app.selectNode(d.source.id);
                                display();

                            }
                            else {

                                config.app.showDangerMsg("You have reached the maximum number of connections for this video.");
                            }
                        }
                        else {

                            breakLink(d.id);
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
                .transition().duration(tranistionTime)
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
                .data(linkGridArray, function(d) { return d.id; })
                .exit()
                .remove();
        }

        function zoom(){

            if((sStart + zRate) < (sEnd - zRate)){

                sStart = sStart + zRate;
                sEnd = sEnd - zRate;
            }

            if((tStart + zRate) < (tEnd - zRate)){

                tStart = tStart + zRate;
                tEnd = tEnd - zRate;
            }
        }

        function expand(max){

            if((sStart - xRate) >= 0){
                sStart = sStart - xRate;
            }

            if((sEnd + xRate) <= max){
                sEnd = sEnd + xRate;
            }

            if((tStart - xRate) >= 0){
                tStart = tStart - xRate;
            }

            if((tEnd + xRate) <= max){
                tEnd = tEnd + xRate;
            }
        }

        this.onKeyInput = function(keyCode){

            var match = false, max;

            max = parent.get('data').getNodeCount();

            switch (keyCode) {

                case arrowKeys.left:

                    if((tStart - mRate) >= 0){
                        tStart = tStart - mRate;
                        tEnd = tEnd - mRate;
                    }

                    match = true;
                    break;

                case arrowKeys.up:

                    if((sStart - mRate) >= 0){
                        sStart = sStart - mRate;
                        sEnd = sEnd - mRate;
                    }

                    match = true;
                    break;

                case arrowKeys.right:

                    if((tEnd + mRate) <= max){
                        tStart = tStart + mRate;
                        tEnd = tEnd + mRate;
                    }

                    match = true;
                    break;

                case arrowKeys.down:

                    if((sEnd + mRate) <= max){
                        sStart = sStart + mRate;
                        sEnd = sEnd + mRate;
                    }

                    match = true;
                    break;

                case arrowKeys.zoom:

                    zoom();
                    match = true;

                    break;

                case arrowKeys.expand:

                    expand(max);
                    match = true;

                    break;
            }

            if(match){
                updateScale();
                display();
            }

            return match;
        };

        this.display = function(){

            updateSvg();
            updateScale();
            display();
        };

        function selectNode(nId){

            if(common.isUndefined(nId)) {
                return;
            }

            config.app.selectNode(nId);
            svg.selectAll("text.node").style({'stroke': 'none', 'stroke-width': 0.5});
            svg.select('#s-' + nId).style({'stroke': 'black', 'stroke-width': 0.5});
        }

        this.selectNode = function(nId){

            selectNode(nId);
        };

        function updateNodeLabel(nId, isSource, doHighlight){

            var id = '#' + ((isSource)? 's-' : 't-') + nId;

            if(doHighlight){

                svg.select(id).style({'font-weight': '900'});
            }
            else {

                svg.select(id).style({'font-weight': 'normal'});
            }
        }

        this.highlight = function(highlights){

            var i, k, highlight, selectResult,
                data = parent.get('data');

            selectResult = svg.selectAll("text");
            selectResult.style({'opacity': 1.0});

            for(k in highlights) {

                switch (k) {

                    case 'title':

                        highlight = highlights.title;

                        if(highlight.value !== ""){
                            selectResult = svg.selectAll("text:not([data-title*='" + highlight.value + "'])");
                            selectResult.transition().style({'opacity': 0.2});
                            highlight.count = data.getNodeCount() - (selectResult[0].length * 0.5);
                        }
                        else {
                            highlight.count = 0;
                        }

                        break;

                    case 'property':

                        highlight = highlights.property;

                        for(i = 0; i < highlight.typeColorArray.length; i++){

                            h = highlight.typeColorArray[i];
                            selectResult = d3.selectAll("text." + h.id);
                            h.count = selectResult[0].length * 0.5;
                            selectResult.style({fill: h.color});
                        }

                        break;
                }
            }


            //for(i = 0; i < typeColorArray.length; i++){
            //
            //    h = typeColorArray[i];
            //
            //    selectResult = d3.selectAll("text." + h.id);
            //    h.count = selectResult[0].length;
            //
            //    selectResult.style({fill: h.color});
            //}
        };

        function breakLink (lId){

            var link,
                data = parent.get('data');

            link = data.removeLink(lId);

            config.app.breakLink(lId);

            display();
        }

        this.breakLink = function(lId){

            breakLink(lId);
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

        this.reset = function(){

            var nodes;

            if(parent.exists()) {

                nodes = svg.selectAll("text.node");

                if(!nodes.empty()) {

                    nodes.style({
                        'opacity': 1.0,
                        'fill': 'black',
                        'text-decoration': 'none',
                        'font-style': 'normal'
                    });
                }
            }
        };

        this.clear = function(){

            if(parent.exists()) {
                svg.selectAll("*").remove();
            }
        };

        function set(config) {

            if (!common.isUndefined(config)) {

                if (!common.isUndefined(config.data)) {

                    sEnd = tEnd = config.data.get('nodes').length;

                    zRate = parseInt(Math.sqrt(sEnd));
                    xRate = zRate;
                    mRate = zRate;

                    console.log(zRate);
                }
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