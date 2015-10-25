define(["common"], function (common) {

    //start
    var ChartNodeLink = function (config) {

        var frame,
            exists,
            width,
            height,
            svg,
            data,
            typeColorScale = d3.scale.category20(),
            ratingColorScale = d3.scale.category20(),
            otherColorScale = d3.scale.category10(),
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

        function hightLight(hArray, colorScale){

            var k, h,
                typeColorArray = [];

            for(k in hArray){

                h = hArray[k];
                c = colorScale(h.id);

                d3.selectAll("circle." + h.id).style({fill: c});

                typeColorArray.push({
                    name: h.name,
                    color: c
                });
            }

            return typeColorArray;
        }

        this.highlight = function(type){

            var typeColorArray = null;

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

        this.clear = function(){

            svg.selectAll("g.links").remove();
            svg.selectAll("g.nodes").remove();
        };

        function focusOnNode(nId){

            resetVisuals();

            svg.selectAll('line:not(.s-' + nId + ')').transition().style({'opacity': 0.1, 'pointer-events': 'none'});
            svg.selectAll('circle:not(.g-' + nId + ')').transition().style({'opacity': 0.1});

            config.app.selectNode(nId);
        }

        this.focusOnNode = function(nId){

            focusOnNode(nId);
        };

        this.makeLink = function(sourceId, targetId){

            var l = data.makeLink(sourceId, targetId);

            svg.select('#' + l.target.id).classed('g-' + l.source.id, true);

            display();

            focusOnNode(sourceId);
        };

        this.breakLink = function(lId){

            var links, l;

            l = data.removeLink(lId);

            svg.select('#' + l.target.id).classed('g-' + l.source.id, false);

            display();

            focusOnNode(l.source.id);

        };

        function updateDisplay(){

            node = svg.selectAll(".node")
                .data(force.nodes(), function(d) { return d.id; });

            link = svg.selectAll(".link")
                .data(force.links(), function(d) { return d.id; });

            force.on("tick", function() {

                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        }

        function display(){

            var linksGroup = svg.select("g.links"),
                nodesGroup = svg.select("g.nodes");

            if(linksGroup.empty()){
                linksGroup = svg.append("g").attr("class", "links");
            }

            if(nodesGroup.empty()){
                nodesGroup = svg.append("g").attr("class", "nodes");
            }

            force.nodes(data.get('nodes')).links(data.get('links')).start();

            linksGroup
                .selectAll("line")
                .data(force.links(), function(d) { return d.id; })
                .enter().append("line")
                .attr("id", function(d, i){
                    return d.id;
                })
                .attr({
                    "class": function(d, i){
                        return d.class;
                    },
                    "marker-end": "url(#arrow)"
                })
                .style("stroke-width", function (d) {
                    return d.weight;
                })
                .on('mouseover', function(d, i){

                    var mouse;

                    if(!d3.event.shiftKey){
                        return;
                    }

                    config.app.hideNodeDialog();

                    mouse = d3.mouse(this);

                    config.app.populateLinkDialog(d);

                    config.app.setLinkDialogLocation({
                        left: mouse[0] + "px",
                        top: mouse[1] + "px"
                    });
                });

            linksGroup
                .selectAll("line")
                .data(force.links(), function(d) { return d.id; })
                .style("stroke-width", function (d) {
                    return d.weight;
                });

            linksGroup
                .selectAll("line")
                .data(force.links(), function(d) { return d.id; })
                .exit()
                .remove();

            nodesGroup
                .selectAll("circle")
                .data(force.nodes(), function(d) { return d.id; })
                .enter().append("circle")
                .attr("id", function(d, i){
                    return d.id;
                })
                .attr({
                    "class": function (d, i) {
                        return d.class;
                    },
                    "r": function(d, i){

                        var weight = 1;
                        if(d.duration > 0){
                            weight = d.duration;
                        }

                        return Math.log(parseInt(weight)* 100);
                    },
                    "data-title": function (d, i) {
                        return d.titleFilter;
                    },
                    "data-group": function(d, i){
                        return d.group;
                    }
                })
                .on('mouseover', function(d, i){

                    var circle;

                    if(!d3.event.shiftKey){
                        return;
                    }

                    config.app.hideLinkDialog();

                    circle = d3.select(this);

                    config.app.setNodeDialogLocation({
                        left: circle.attr("cx") + "px",
                        top: circle.attr("cy") + "px"
                    });

                    config.app.populateNodeDialog(d);
                })
                .append("title")
                .text(function (d) {
                    return d.title;
                });

            updateDisplay();
        }

        function resetVisuals(){

            svg.selectAll('line').style({'opacity': 1.0, 'pointer-events': 'auto'});
            svg.selectAll('circle').style({'opacity': 1.0});
        }

        function updateSvg(){

            if(exists) {

                svg = frame.select("svg");
                width = parseInt(svg.style("width"), 10);
                svg.attr('height', width);
                height = width;

                force.size([width, height]);
            }
        }

        this.display = function(){

            updateSvg();
            display();
        };

        this.adjustLinkWeight = function(sNodeId, startIndex, endIndex){

            data.adjustLinkWeight(sNodeId, startIndex, endIndex);

            display();
        };

        function changeLinkColor(lId, doHighlight){

            if(doHighlight){
                svg.select('#' + lId).classed('highlight', true);
            }
            else {
                svg.select('#' + lId).classed('highlight', false);
            }
        }

        this.changeLinkColor = function(lId, doHighlight){
            changeLinkColor(lId, doHighlight);
        };

        this.filterNode = function(value){

            resetVisuals();

            if(value !== ""){
                svg.selectAll('line').transition().style({'opacity': 0.1, 'pointer-events': 'none'});
                svg.selectAll("circle:not([data-title*='" + value + "'])").transition().style({'opacity': 0.1});
            }
        };

        function set(config) {

            if (!common.isUndefined(config)) {

                if (!common.isUndefined(config.selector)) {

                    frame = d3.select(config.selector);
                    exists = !frame.empty();

                    if(exists) {

                        svg = frame.select("svg");
                        //svg = frame.select("svg").call(d3.behavior.zoom().on("zoom", function () {
                        //    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                        //}));

                        svg.on('click', function(){

                            config.app.hideNodeDialog();
                            config.app.hideLinkDialog();

                        });

                        width = parseInt(svg.style("width"), 10);
                        height = parseInt(svg.style("height"), 10);

                        force.size([width, height]);
                    }
                }

                if (!common.isUndefined(config.data)) {
                    data = config.data;
                }
            }
        }

        //public setter
        this.set = function(config){
            set(config);
        };

        function get(key){

            var value = null;

            if(key === "data") {
                value = data;
            }

            return value;
        }

        //public getter
        this.get = function(key){
            return get(key);
        };

    };

    return {

        getInstance: function(config) {
            return new ChartNodeLink(config);
        }
    };

});