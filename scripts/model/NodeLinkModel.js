define(
    [
        "d3",
        "common",
        "dispatch",
        "chart/chartUtil"
    ],

    function (d3, common, dispatch, chartUtil) {

        var NodeLinkModel = function (config) {

            var attributes = {
                    selectedNodeId: undefined,

                    zRate: 3,
                    xRate: 3,
                    mRate: 3,

                    sStart: 0,
                    sEnd: undefined,
                    tStart: 0,
                    tEnd: undefined,

                    get sRange() {
                        return this.sEnd - this.sStart;
                    },

                    get tRange() {
                        return this.tEnd - this.tStart;
                    }
                },
                MAX_LINKS = 6,
                DATA_PATH = "/hci_prototype_1/data_sho/",
                URL_BASE = "http://www.smithsonianchannel.com/videos/video",
                nodeArray,
                nodeDescArray,
                nodeMap,
                linkArray,
                linkMap,
                nodeLinksMap,

                service = {
                    graph_url: "/shomin/tools/video/graph.rest",
                    graph_link_url: "/shomin/tools/video/graph/link.rest",
                    graph_detach_url: "/shomin/tools/video/graph/detach.rest",
                    graph_remove_detach_url: "/shomin/tools/video/graph/detach/remove.rest"
                },

                prefix = {

                    type: 't-',
                    status: 's-',
                    rating: 'r-',
                    match: 'm-',
                    restriction: 'a-',
                    "title-type": 'tt-',
                    group: 'g-'
                };

            initModel();
            set(config);

            function initModel(){

                nodeArray = [];
                nodeDescArray = [];
                nodeMap = [];
                linkArray = [];
                linkMap = [];
                nodeLinksMap = [];

                attributes.sStart = 0;
                attributes.tStart = 0;
            }

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function get(){
                return common.getAttributes(arguments, attributes);
            }

            function getNodeId(id){
                return 'n-' + id;
            }

            function getLinkId(sourceId, targetId){
                return 'l-' + sourceId + "-" + targetId;
            }

            function getNodeArray(iStart, iEnd, sDesc){

                var nArray;

                iStart = (iStart === undefined || iStart < 0) ? 0 : iStart;
                iEnd = (iEnd === undefined || iEnd > nodeArray.length) ? nodeArray.length : iEnd;
                sDesc = (sDesc === undefined) ? false : sDesc;

                if(iStart === 0 && iEnd === nodeArray.length){

                    if(sDesc){
                        nArray = nodeDescArray;
                    }
                    else {
                        nArray = nodeArray;
                    }
                }
                else {

                    if(sDesc){
                        nArray = nodeDescArray.slice(nodeDescArray.length - iEnd, nodeDescArray.length - iStart);
                    }
                    else {
                        nArray = nodeArray.slice(iStart, iEnd);
                    }
                }

                return nArray;
            }

            function getLinkView(data){

                var classOutArray = [
                        "link"
                    ],
                    linkView = {

                        rank: 0,
                        weight: 0,
                        isManual: false,
                        isDetach: false
                    };

                if (data.link !== undefined) {

                    linkView.lId = data.link.lId;

                    linkView.source = data.link.source;
                    linkView.target = data.link.target;

                    linkView.rank = data.link.rank;
                    linkView.weight = data.link.weight;
                    linkView.isManual = data.link.isManual;
                    linkView.isDetach = data.link.isDetach;
                }
                else if(data.sNode !== undefined && data.tNode !== undefined){

                    linkView.lId = getLinkId(data.sNode.id, data.tNode.id);

                    linkView.source = data.sNode;
                    linkView.target = data.tNode;
                }
                else {
                    throw "Need a source and target for link view.";
                }

                classOutArray.push("s-" + linkView.source.id);
                classOutArray.push("t-" + linkView.target.id);

                linkView.class = classOutArray.join(" ");

                return linkView;
            }

            function getLinkViewArray(){

                var i, link, linkView,
                    linkViewArray = [];

                for(i = 0; i < linkArray.length; i++){

                    link = linkArray[i];
                    linkView = getLinkView({link: link});
                    linkViewArray.push(linkView);
                }

                return linkViewArray;
            }

            function getLinkGridViewArray(sStart, sEnd, tStart, tEnd){

                var i, j,
                    sNode, tNode,
                    sNodeArray = getNodeArray(sStart, sEnd),
                    tNodeArray = getNodeArray(tStart, tEnd),
                    lId, link, linkView,
                    linkGridArray = [];

                for(i = 0; i < sNodeArray.length; i++){

                    sNode = sNodeArray[i];

                    for(j = 0; j < tNodeArray.length; j++){

                        tNode = tNodeArray[j];

                        lId = getLinkId(sNode.id, tNode.id);
                        link = linkMap[lId];

                        linkView = getLinkView({
                            link: link,
                            sNode: sNode,
                            tNode: tNode
                        });

                        linkGridArray.push(linkView);
                    }
                }

                return linkGridArray;
            }

            function getMaxNodeTitleLength(){

                var i = 0, l = 0, titleLength = 0;
                for(i = 0; i < nodeArray.length; i++){
                    l = nodeArray[i].title.length;
                    if(l > titleLength){
                        titleLength = l;
                    }
                }

                return titleLength;
            }

            function populate(data){

                var i, n, l;

                if(data.nodes !== undefined && data.links !== undefined) {

                    //add nodes
                    for(i = 0; i < data.nodes.length; i++){

                        n = data.nodes[i];
                        addNode(n);
                    }

                    //add links
                    for(i = 0; i < data.links.length; i++){

                        l = data.links[i];
                        addLink(createLinkByIndex(l));
                    }

                    nodeArray.sort(function(a, b) {

                        if (a.title > b.title) {
                            return 1;
                        }
                        if (a.title < b.title) {
                            return -1;
                        }
                        // a must be equal to b
                        return 0;
                    });

                    nodeDescArray = nodeArray.slice();

                    nodeDescArray.sort(function(a, b) {

                        if (a.title < b.title) {
                            return 1;
                        }
                        if (a.title > b.title) {
                            return -1;
                        }
                        // a must be equal to b
                        return 0;
                    });

                    attributes.sEnd = attributes.tEnd = nodeArray.length;
                }
            }

            function addNode(node){

                var classOutArray = [
                    "node",
                    prefix.type + node.type,
                    prefix.status + node.status,
                    prefix.rating + node.rating,
                    prefix.match + ((node.isMatch) ? "match" : "no-match"),
                    prefix.restriction + ((node.ageGate) ? "restricted" : "unrestricted"),
                    prefix["title-type"] + (((node.seriesId > 0) ? "series" : "show")),
                    prefix.group + node.id
                ];

                node.nId = getNodeId(node.id);
                node.titleFilter = node.title.toLowerCase().replace(/'/g, '');
                node.threePartKey = node.seriesId + '_' + node.seasonNumber + '_' + node.showId;
                node.url = URL_BASE + '/' + node.id;
                node.class = classOutArray.join(' ');

                nodeMap[node.nId] = node;
                nodeArray.push(node);
            }

            function createLinkByIndex(l){

                l.source = nodeArray[l.source];
                l.target = nodeArray[l.target];

                l.lId = getLinkId(l.source.id, l.target.id);

                return l;
            }

            function createLinkByIds(l){

                l.source = nodeMap[getNodeId(l.source)];
                l.target = nodeMap[getNodeId(l.target)];

                l.lId = getLinkId(l.source.id, l.source.id);

                return l;
            }

            function addLink(link){

                var nodeLinks = nodeLinksMap[link.source.nId];

                linkMap[link.lId] = link;
                linkArray.push(link);

                if(nodeLinks === undefined){

                    nodeLinks = [];
                }

                nodeLinks.push({
                    l: link,
                    n: link.target
                });

                nodeLinksMap[link.source.nId] = sortNodeLinkArray(nodeLinks);
            }

            function removeLink(lId){

                var i, l, index, nodeLinks, link = linkMap[lId];

                //remove from linkArray
                index = -1;
                for(i = 0; i < linkArray.length; i++){

                    if(linkArray[i].lId === lId){
                        index = i;
                        break;
                    }
                }

                if(index >= 0){
                    linkArray.splice(index, 1);
                }

                //remove from nodeLinksMap
                nodeLinks = nodeLinksMap[link.source.nId];
                if(nodeLinks !== undefined) {

                    index = -1;
                    for(i = 0; i < nodeLinks.length; i++){

                        if(nodeLinks[i].l.lId === lId){
                            index = i;
                            break;
                        }
                    }

                    if (index >= 0) {
                        nodeLinks.splice(index, 1);
                    }

                    nodeLinksMap[link.source.nId] = sortNodeLinkArray(nodeLinks);

                    //for(i = 0; i < nodeLinks.length; i++){
                    //    nodeLinks[i].l.weight = i;
                    //}
                }

                //remove from linkMap
                linkMap[lId] = undefined;
            }

            function sortNodeLinkArray(nodeLinkArray){

                nodeLinkArray.sort(function(a, b) {

                    if (a.l.weight > b.l.weight) {
                        return 1;
                    }
                    if (a.l.weight < b.l.weight) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                });

                return nodeLinkArray;
            }

            function getMaxWeight(nId){

                var i, w = 0, nodeLink,
                    nodeLinks = nodeLinksMap[nId];

                if(nodeLinks !== undefined){

                    for(i = 0; i < nodeLinks.length; i++){

                        nodeLink = nodeLinks[i];
                        if(nodeLink.l.weight > w){
                            w = nodeLink.l.weight;
                        }
                    }
                }

                return w;
            }

            function getNode(nId){
                return nodeMap[nId];
            }

            function getSelectedNode(){

                var node;

                if(attributes.selectedNodeId !== undefined) {
                    node = nodeMap[attributes.selectedNodeId];
                }

                return node;
            }

            function getLink(lId){
                return linkMap[lId];
            }

            function hasLink(lId){
                return linkMap[lId] !== undefined;
            }

            function isSelectedNodeId(nId){
                return (attributes.selectedNodeId === nId);
            }

            function isConnected(sourceId, targetId){

                var lId = getLinkId(sourceId, targetId);
                return linkMap[lId] !== undefined;
            }

            function isConnectedToSelected(targetId){

                var selectedNode = getSelectedNode();

                return isConnected(selectedNode.id, targetId);
            }

            function getNodeLink(sNodeId, tNodeId){

                var i, nl, nodeLink, nodeLinkArray = nodeLinksMap[sNodeId];

                for(i = 0; i < nodeLinkArray.length; i++){

                    nl = nodeLinkArray[i];
                    if(nl.n.nId === tNodeId){
                        nodeLink = nl;
                        break;
                    }
                }

                return nodeLink;
            }

            function updateSelectedLink(tId){

                var selectedNode = getSelectedNode();
                if(selectedNode !== undefined){

                    updateLink({
                        sId: selectedNode.id,
                        tId: tId
                    });
                }
            }

            function updateLink(data){

                var url,
                    nodeLinks,
                    sNodeId = getNodeId(data.sId),
                    tNodeId = getNodeId(data.tId),
                    sNode = nodeMap[sNodeId],
                    tNode = nodeMap[tNodeId],
                    lId = getLinkId(data.sId, data.tId),
                    link = linkMap[lId];

                //is connected
                if(link !== undefined){

                    if(link.isDetach){
                        url = service.graph_remove_detach_url;
                    }
                    else {
                        url = service.graph_detach_url;
                    }

                    $.ajax({
                        type: "POST",
                        url: url,
                        data: {
                            sourceVideoId: sNode.id,
                            targetVideoId: tNode.id
                        },
                        success: function(response){

                            removeLink(lId);

                            if(!link.isDetach) {
                                addLink(createLinkByIds(response.data));
                            }

                            dispatch.publish("model_update_link_success", data);
                        },
                        error: function(data){

                            dispatch.publish("view_flash", {
                                type: "danger",
                                message: "An error occurred during link detachment."
                            });
                        }
                    });
                }
                else {

                    nodeLinks = nodeLinksMap[sNode.nId];
                    if(nodeLinks === undefined || nodeLinks.length < MAX_LINKS){

                        $.ajax({
                            type: "POST",
                            url: service.graph_link_url,
                            data: {
                                sourceVideoId: sNode.id,
                                targetVideoId: tNode.id
                            },
                            success: function(response){

                                console.log(response);
                                addLink(createLinkByIds(response.data));

                                dispatch.publish("model_update_link_success", data);
                            },
                            error: function(data){

                                dispatch.publish("view_flash", {
                                    type: "danger",
                                    message: "An error occurred during link creation."
                                });
                            }
                        });
                    }
                    else {

                        dispatch.publish("view_flash", {
                            type: "danger",
                            message: "You've reached the maximum number of links for \"" + sNode.title + "\""
                        });
                    }
                }
            }

            function getTitleStats(title){

                var i, node,
                    stats = {
                        value: title,
                        count: 0
                    };

                if(!common.isBlankStr(title)){

                    for(i = 0; i < nodeArray.length; i++) {
                        node = nodeArray[i];

                        if(node.titleFilter.indexOf(title) > -1){
                            stats.count = stats.count + 1;
                        }
                    }
                }

                return stats;
            }

            function getPropertyStats(category){

                var i, k, node, stats = {}, properties = [];

                for(i = 0; i < nodeArray.length; i++){
                    node = nodeArray[i];

                    switch(category){

                        case "type":

                            if(stats[node.type] === undefined){
                                stats[node.type] = 0;
                            }

                            stats[node.type]++;

                            break;

                        case "rating":

                            if(stats[node.rating] === undefined){
                                stats[node.rating] = 0;
                            }

                            stats[node.rating]++;

                            break;

                        case "title-type":

                            if(stats.series === undefined){
                                stats.series = 0;
                            }

                            if(stats.show === undefined){
                                stats.show = 0;
                            }

                            if(node.seriesId > 0){
                                stats.series++;
                            }
                            else {
                                stats.show++;
                            }

                            break;

                        case "restriction":

                            if(stats.restricted === undefined){
                                stats.restricted = 0;
                            }

                            if(stats.unrestricted === undefined){
                                stats.unrestricted = 0;
                            }

                            if(node.ageGate){
                                stats.restricted++;
                            }
                            else {
                                stats.unrestricted++;
                            }

                            break;

                        case "status":

                            if(stats[node.status] === undefined){
                                stats[node.status] = 0;
                            }

                            stats[node.status]++;

                            break;

                        case "match":

                            if(stats.match === undefined){
                                stats.match = 0;
                            }

                            if(stats["no-match"] === undefined){
                                stats["no-match"] = 0;
                            }

                            if(node.isMatch){
                                stats.match++;
                            }
                            else {
                                stats["no-match"]++;
                            }

                            break;
                    }
                }

                for(k in stats){

                    properties.push({
                        name: k,
                        count: stats[k]
                    });
                }

                properties.sort(function(a, b) {

                    return (a.count < b.count) ? 1 : ((a.count > b.count) ? -1 : 0);
                });

                return {
                    category: {
                        name: category,
                        prefix: prefix[category]
                    },
                    properties: properties
                };
            }

            function loadData(inputArray){

                var url = service.graph_url + "?" + $.param( inputArray, true );

                dispatch.publish("view_loading_show", {});

                d3.json(url, function(error, response) {

                    if(error === null){

                        if(response.data.nodeCount > 200){

                            dispatch.publish("view_flash", {
                                type: "warning",
                                message: "The search criteria you provided returned too many search results. Please refine your search."
                            });
                        }
                        else {

                            initModel();

                            populate(response.data);

                            dispatch.publish("model_data_loaded", {
                                resultSize: nodeArray.length
                            });
                        }
                    }
                    else {

                        dispatch.publish("view_flash", {
                            type: "danger",
                            message: "An error occurred while performing your search."
                        });
                    }

                    dispatch.publish("view_loading_hide", {});
                });
            }

            function loadDataFromDisk(inputArray){

                var isMatch = false,
                    graph;

                jQuery.each( inputArray, function( i, input ) {

                    if(input.name === "showId"){

                        switch(input.value){

                            case "3412157":
                                graph = "graph_show_3412157.json";
                                isMatch = true;
                                break;

                            case "3413913":
                                graph = "graph_show_3413913.json";
                                isMatch = true;
                                break;
                        }

                    }
                    else if(input.name === "seriesId"){

                        switch(input.value){

                            case "701":
                                graph = "graph_series_701.json";
                                isMatch = true;
                                break;

                            case "1003303":
                                graph = "graph_series_1003303.json";
                                isMatch = true;
                                break;
                        }

                    }
                    else if(input.name === "keywords"){

                        switch(input.value){

                            case "song":
                                graph = "graph_song.json";
                                isMatch = true;
                                break;

                            case "magic":
                                graph = "graph_magic.json";
                                isMatch = true;
                                break;

                            /*
                            case "test":
                                graph = "graph_test.json";
                                isMatch = true;
                                break;

                            case "america":
                                graph = "graph_america.json";
                                isMatch = true;
                                break;

                            case "bionic":
                                graph = "graph_bionic.json";
                                isMatch = true;
                                break;

                            case "speed":
                                graph = "graph_speed.json";
                                isMatch = true;
                                break;

                            case "design":
                                graph = "graph_design.json";
                                isMatch = true;
                                break;

                            case "crime":
                                graph = "graph_crime.json";
                                isMatch = true;
                                break;

                            case "robots":
                                graph = "graph_robots.json";
                                isMatch = true;
                                break;
                            */
                        }
                    }
                });

                if(isMatch){

                    initModel();

                    dispatch.publish("view_loading_show", {});

                    d3.json(DATA_PATH + graph, function(error, response) {

                        populate(response.data);

                        //console.log(response.data);

                        dispatch.publish("model_data_loaded", {
                            resultSize: nodeArray.length
                        });

                        dispatch.publish("view_loading_hide", {});
                    });
                }
                else {

                    dispatch.publish("view_flash", {
                        type: "warning",
                        message: "The search criteria you provided returned too many search results. Please refine your search."
                    });
                }
            }

            function getSourceMoveRate(){

                var moveRate = Math.floor(Math.pow(attributes.sRange, 0.8));
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getTargetMoveRate(){

                var moveRate = Math.floor(Math.pow(attributes.tRange, 0.8));
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getSourceZoomRate(){

                var moveRate = Math.floor(attributes.sRange * 0.25);
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getTargetZoomRate(){

                var moveRate = Math.floor(attributes.tRange * 0.25);
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function move(direction){

                var moveRate,
                    sMoveRate = getSourceMoveRate(),
                    tMoveRate = getTargetMoveRate();

                switch (direction) {

                    case "left":

                        if((attributes.tStart - tMoveRate) >= 0){
                            attributes.tStart = attributes.tStart - tMoveRate;
                            attributes.tEnd = attributes.tEnd - tMoveRate;
                        }
                        else {
                            attributes.tEnd = attributes.tEnd - attributes.tStart;
                            attributes.tStart = 0;
                        }

                        break;

                    case "up":

                        if((attributes.sStart - sMoveRate) >= 0){
                            attributes.sStart = attributes.sStart - sMoveRate;
                            attributes.sEnd = attributes.sEnd - sMoveRate;
                        }
                        else {
                            attributes.sEnd = attributes.sEnd - attributes.sStart;
                            attributes.sStart = 0;
                        }

                        break;

                    case "right":

                        if((attributes.tEnd + tMoveRate) <= nodeArray.length){
                            attributes.tStart = attributes.tStart + tMoveRate;
                            attributes.tEnd = attributes.tEnd + tMoveRate;
                        }
                        else {

                            moveRate = nodeArray.length - attributes.tEnd;
                            attributes.tStart = attributes.tStart + moveRate;
                            attributes.tEnd = nodeArray.length;
                        }

                        break;

                    case "down":

                        if((attributes.sEnd + sMoveRate) <= nodeArray.length){
                            attributes.sStart = attributes.sStart + sMoveRate;
                            attributes.sEnd = attributes.sEnd + sMoveRate;
                        }
                        else {

                            moveRate = nodeArray.length - attributes.sEnd;
                            attributes.sStart = attributes.sStart + moveRate;
                            attributes.sEnd = nodeArray.length;
                        }

                        break;
                }
            }

            function zoom(){

                var sMoveRate = getSourceZoomRate(),
                    tMoveRate = getTargetZoomRate();

                if((attributes.sStart + sMoveRate) < (attributes.sEnd - sMoveRate)){

                    attributes.sStart = attributes.sStart + sMoveRate;
                    attributes.sEnd = attributes.sEnd - sMoveRate;
                }

                if((attributes.tStart + tMoveRate) < (attributes.tEnd - tMoveRate)){

                    attributes.tStart = attributes.tStart + tMoveRate;
                    attributes.tEnd = attributes.tEnd - tMoveRate;
                }
            }

            function expand(){

                var sMoveRate = getSourceMoveRate(),
                    tMoveRate = getTargetMoveRate();

                //source start
                if((attributes.sStart - sMoveRate) >= 0){
                    attributes.sStart = attributes.sStart - sMoveRate;
                }
                else {
                    attributes.sStart = 0;
                }

                //source end
                if((attributes.sEnd + sMoveRate) <= nodeArray.length){
                    attributes.sEnd = attributes.sEnd + sMoveRate;
                }
                else {
                    attributes.sEnd = nodeArray.length;
                }

                //target start
                if((attributes.tStart - tMoveRate) >= 0){
                    attributes.tStart = attributes.tStart - tMoveRate;
                }
                else {
                    attributes.tStart = 0;
                }

                //target end
                if((attributes.tEnd + tMoveRate) <= nodeArray.length){
                    attributes.tEnd = attributes.tEnd + tMoveRate;
                }
                else {
                    attributes.tEnd = nodeArray.length;
                }
            }

            function nodeDomainMap(d){
                return d.id;
            }

            function linkDomainMap(d){
                return d.lId;
            }

            /***** public methods *****/

            this.set = set;
            this.get = get;

            this.zoom = zoom;
            this.move = move;
            this.expand = expand;

            this.getNodeId = getNodeId;
            this.getLinkId = getLinkId;

            this.breakLink = function(lId){

                removeLink(lId);

                dispatch.publish("model_remove_link_success", {
                    lId: lId
                });
            };

            this.updateLink = updateLink;
            this.isConnected = isConnected;
            this.isSelectedNodeId = isSelectedNodeId;
            this.hasLink = hasLink;
            this.getLink = getLink;
            this.getNode = getNode;
            this.getNodeLink = getNodeLink;
            this.updateSelectedLink = updateSelectedLink;

            this.getSelectedNode = getSelectedNode;

            this.loadData = loadData;

            /***** view model methods *****/

            this.getStatsViewModel = function(input){

                var stats = {
                    selectedNode: getSelectedNode()
                };

                if(input.title !== undefined){
                    stats.title = getTitleStats(input.title);
                }

                if(input.property !== undefined){
                    stats.property = getPropertyStats(input.property);
                    chartUtil.decorateWithColor(stats.property);
                }

                return stats;
            };

            this.getResultViewModel = function(){

                return {
                    resultSize: nodeArray.length
                };
            };

            this.getListViewModel = function(){

                var i, nodeView, nodeLinks,
                    selectedNode = getSelectedNode(),
                    nodeViewArray = nodeArray.slice(),
                    hasSelectedNode = (selectedNode !== undefined);

                for(i = 0; i < nodeViewArray.length; i++){
                    nodeView = nodeViewArray[i];

                    nodeView.isSelected = false;
                    nodeView.isConnected = false;
                    nodeView.hasSelectedNode = hasSelectedNode;
                    if(hasSelectedNode){
                        nodeView.isSelected = (nodeView.nId === selectedNode.nId);
                        if(!nodeView.isSelected){
                            nodeView.isConnected = isConnected(selectedNode.id, nodeView.id);
                        }
                    }

                    nodeView.connections = 0;
                    nodeLinks = nodeLinksMap[nodeView.nId];
                    if(nodeLinks !== undefined){
                        nodeView.connections = nodeLinks.length;
                    }
                }

                return {
                    nodeArray: nodeViewArray
                };
            };

            this.getAdjacencyMatrixViewModel = function(){

                return {
                    sNodeArray: getNodeArray(attributes.sStart, attributes.sEnd),
                    sNodeArrayDesc: getNodeArray(attributes.sStart, attributes.sEnd, true),
                    tNodeArray: getNodeArray(attributes.tStart, attributes.tEnd),
                    linkGridArray: getLinkGridViewArray(attributes.sStart, attributes.sEnd, attributes.tStart, attributes.tEnd),
                    maxNodeTitleLength: getMaxNodeTitleLength(),
                    nodeDomainMap: nodeDomainMap,
                    linkDomainMap: linkDomainMap
                };
            };

            this.getSelectViewModel = function(){

                var selectedNode = getSelectedNode(),
                    viewModel = {
                        node: selectedNode,
                        links: []
                    },
                    nodeLinks = nodeLinksMap[selectedNode.nId];

                if(nodeLinks !== undefined){
                    viewModel.links = nodeLinks;
                }

                return viewModel;
            };

            this.getNodeLinkViewModel = function(){

                return {
                    nodeArray: nodeArray,
                    linkArray: getLinkViewArray(),
                    nodeDomainMap: nodeDomainMap,
                    linkDomainMap: linkDomainMap
                };
            };

            this.getAdjMatrixWindowViewModel = function(){

                return {

                    xMin: 0,
                    xMax: nodeArray.length,
                    xStart: attributes.tStart,
                    xEnd: attributes.tEnd,

                    yMin: 0,
                    yMax: nodeArray.length,
                    yStart: attributes.sStart,
                    yEnd: attributes.sEnd
                };
            };

            this.getMatrixInfoViewModel = function(data){

                var source, target,
                    link = getLink(data.lId);

                if(link === undefined){

                    link = {
                        lId: data.lId,
                        rank: 0,
                        weight: 0,
                        source: getNode(data.sNodeId),
                        target: getNode(data.tNodeId)
                    };
                }

                return {
                    link: link
                };
            };

            this.getNodeDialogViewModel = function(data){

                var node = getNode(data.nId),
                    selectedNodeId,
                    selectedNode = getSelectedNode(),
                    hasSelected = selectedNode !== undefined,
                    isConnectedToSelected = false,
                    isSelectedConnectedToThis = false;

                if(hasSelected){

                    selectedNodeId = selectedNode.id;

                    isConnectedToSelected = isConnected(selectedNode.id, data.id);
                    isSelectedConnectedToThis = isConnected(data.id, selectedNode.id);
                }

                return {
                    id: node.id,
                    nId: node.nId,
                    "n-d-id": node.id,
                    "n-d-title": node.title,
                    "n-d-type": node.type,
                    "n-d-series-id": node.seriesId,
                    "n-d-season-number": node.seasonNumber,
                    "n-d-show-id": node.showId,
                    selectedNodeId: selectedNodeId,
                    hasSelected: hasSelected,
                    isConnectedToSelected: isConnectedToSelected,
                    isSelectedConnectedToThis: isSelectedConnectedToThis
                };
            };

            this.getLinkDialogViewModel = function(data){

                var link = getLink(data.lId);

                return {
                    lId: link.lId,
                    source: link.source.title,
                    target: link.target.title,
                    "d-l-info-rank": link.rank
                };
            };
        };

        return function(config){
            return new NodeLinkModel(config);
        };
    }
);
