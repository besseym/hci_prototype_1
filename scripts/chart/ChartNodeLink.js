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

        this.highlight = function(highlights){

            var i, k, highlight, selectResult;

            //svg.selectAll('line').transition().style({'opacity': 0.1, 'pointer-events': 'none'});
            svg.selectAll("circle").style({'stroke': '#fff'});

            for(k in highlights) {

                switch (k) {

                    case 'title':

                        highlight = highlights.title;

                        if(highlight.value !== ""){
                            selectResult = svg.selectAll("circle[data-title*='" + highlight.value + "']");
                            selectResult.style({'stroke': 'gold'});
                            //selectResult = svg.selectAll("circle:not([data-title*='" + highlight.value + "'])");
                            //selectResult.transition().style({'opacity': 0.1});
                            highlight.count = selectResult[0].length;
                        }
                        else {
                            highlight.count = 0;
                        }

                        break;

                    case 'property':

                        highlight = highlights.property;

                        for(i = 0; i < highlight.typeColorArray.length; i++){

                            h = highlight.typeColorArray[i];
                            selectResult = d3.selectAll("circle." + h.id);
                            h.count = selectResult[0].length;
                            selectResult.style({fill: h.color});
                        }

                        break;
                }
            }

            //for(i = 0; i < typeColorArray.length; i++){
            //
            //    h = typeColorArray[i];
            //
            //    selectResult = d3.selectAll("circle." + h.id);
            //    h.count = selectResult[0].length;
            //
            //    selectResult.style({fill: h.color});
            //}
            //
            //return typeColorArray;
        };

        this.clear = function(){

            if(exists) {
                svg.selectAll("g.links").remove();
                svg.selectAll("g.nodes").remove();
            }
        };

        this.reset = function() {

            if (exists) {
                resetVisuals();
            }
        };

        function focusOnNode(nId){

            if(common.isUndefined(nId)) {
                return;
            }

            svg.selectAll('line').style({'opacity': 1.0, 'pointer-events': 'auto'});
            svg.selectAll('circle').style({'opacity': 1.0});

            svg.selectAll('line:not(.s-' + nId + ')').transition().style({'opacity': 0.1, 'pointer-events': 'none'});
            svg.selectAll('circle:not(.g-' + nId + ')').transition().style({'opacity': 0.3});

            config.app.selectNode(nId);
        }

        this.focusOnNode = function(nId){

            focusOnNode(nId);
        };

        this.makeLink = function(sourceId, targetId){

            var l;

            config.app.makeLink(sourceId, targetId);

            l = data.makeLink(sourceId, targetId);

            svg.select('#' + l.target.id).classed('g-' + l.source.id, true);

            display();

            focusOnNode(sourceId);
        };

        this.breakLink = function(lId){

            var l;

            config.app.breakLink(lId);

            l = data.removeLink(lId);

            display();

            focusOnNode(l.source.id);

        };

        function display(){

            var nodes, links,
                linksGroup = svg.select("g.links"),
                nodesGroup = svg.select("g.nodes");

            if(linksGroup.empty()){
                linksGroup = svg.append("g").attr("class", "links");
            }

            if(nodesGroup.empty()){
                nodesGroup = svg.append("g").attr("class", "nodes");
            }

            force.nodes(data.get('nodes')).links(data.get('links')).start();

            nodesGroup
                .selectAll("circle")
                .data(force.nodes(), function(d) { return d.id; })
                .enter().append("circle")
                .attr({
                    "id": function(d, i){
                        return d.id;
                    },
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

                    //if(!d3.event.shiftKey){
                    //    return;
                    //}

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
                .on('mouseover', function(d, i){

                    var mouse;

                    //if(!d3.event.shiftKey){
                    //    return;
                    //}

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
                    return Math.sqrt((1 / d.rank) * 20);
                    //return (1 / d.weight) * 10;
                });

            linksGroup
                .selectAll("line")
                .data(force.links(), function(d) { return d.id; })
                .exit()
                .remove();

            nodes = nodesGroup.selectAll(".node")
                .data(force.nodes(), function(d) { return d.id; })
                .attr({
                    "class": function (d, i) {
                        return d.class;
                    }
                });

            links = linksGroup.selectAll(".link")
                .data(force.links(), function(d) { return d.id; });

            force.on("tick", function() {

                links.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                nodes.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        }

        function resetVisuals(){

            svg.selectAll('line').style({'opacity': 1.0, 'pointer-events': 'auto'});
            svg.selectAll('circle').style({'opacity': 1.0, fill: '#555'});
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