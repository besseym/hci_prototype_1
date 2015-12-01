define(
    ["d3", "common", "courier"],

    function (d3, common, courier) {

        var NodeLinkModel = function (config) {

            var dataPath = "/hci_prototype_1/data/",
                urlBase = "http://www.smithsonianchannel.com/videos/video",
                nodeArray,
                nodeDescArray,
                nodeMap,
                linkArray,
                linkMap,
                nodeLinksMap;

            initModel();

            function initModel(){

                nodeArray = [];
                nodeDescArray = [];
                nodeMap = [];
                linkArray = [];
                linkMap = [];
                nodeLinksMap = [];
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

            function getLinkGridArray(sStart, sEnd, tStart, tEnd){

                var i, j,
                    sNode, tNode,
                    sNodeArray = getNodeArray(sStart, sEnd),
                    tNodeArray = getNodeArray(tStart, tEnd),
                    lId, link, classOutArray,
                    linkGridArray = [];

                for(i = 0; i < sNodeArray.length; i++){

                    sNode = sNodeArray[i];

                    for(j = 0; j < tNodeArray.length; j++){

                        tNode = tNodeArray[j];

                        lId = getLinkId(sNode.id, tNode.id);
                        link = linkMap[lId];

                        if (link === undefined) {

                            classOutArray = [
                                "link",
                                "s-" + sNode.id,
                                "t-" + tNode.id
                            ];

                            link = {
                                id: lId,
                                class: classOutArray.join(" "),
                                source: sNode,
                                target: tNode,
                                weight: 0
                            };
                        }

                        linkGridArray.push(link);
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
                        addLink(l);
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
                }
            }

            function addNode(node){

                var classOutArray = [
                    "node",
                    't-' + node.type,
                    's-' + node.status,
                    'r-' + node.rating.toLowerCase(),
                    'm-' + node.isMatch,
                    'a-' + node.ageGate,
                    'tt-' + ((node.seriesId > 0) ? "series" : "show"),
                    'g-' + node.id
                ];

                node.nId = getNodeId(node.id);
                node.titleFilter = node.title.toLowerCase().replace(/'/g, '');
                node.threePartKey = node.seriesId + '_' + node.seasonNumber + '_' + node.showId;
                node.url = urlBase + '/' + node.id;
                node.class = classOutArray.join(' ');

                nodeMap[node.nId] = node;
                nodeArray.push(node);
            }

            function addLink(link){

                return makeLink(nodeArray[link.source], nodeArray[link.target], link.weight);
            }

            function makeLink(sNode, tNode, weight){

                var link = {
                        lId: 'l-' + sNode.id + "-" + tNode.id,
                        source: sNode,
                        target: tNode,
                        weight: weight
                    },
                    nodeLinks = nodeLinksMap[sNode.nId];

                linkMap[link.lId] = link;
                linkArray.push(link);

                if(nodeLinks === undefined){

                    nodeLinks = [];
                }

                nodeLinks.push({
                    l: link,
                    n: tNode
                });

                nodeLinksMap[sNode.nId] = sortNodeLinkArray(nodeLinks);
            }

            function breakLink(lId){

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

                return link;
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

            function isConnected(sourceId, targetId){

                var lId = getLinkId(sourceId, targetId);
                return linkMap[lId] !== undefined;
            }

            function updateLink(sourceId, targetId){

                var sNode, tNode, weight,
                    lId = getLinkId(sourceId, targetId);

                //is connected
                if(linkMap[lId] !== undefined){
                    breakLink(lId);
                }
                else {

                    sNode = nodeMap[getNodeId(sourceId)];
                    tNode = nodeMap[getNodeId(targetId)];
                    weight = getMaxWeight(sNode.nId) + 1;

                    makeLink(sNode, tNode, weight);
                }
            }

            function getStats(property){

                var i, k, node, stats = {}, properties = [];

                for(i = 0; i < nodeArray.length; i++){
                    node = nodeArray[i];

                    switch(property){

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

                            if(stats.no_match === undefined){
                                stats.no_match = 0;
                            }

                            if(node.isMatch){
                                stats.match++;
                            }
                            else {
                                stats.no_match++;
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
                    properties: properties
                };
            }

            function loadData(inputArray){

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
                        }
                    }
                });

                if(isMatch){

                    initModel();

                    d3.json(dataPath + graph, function(error, data) {

                        populate(data);

                        courier.publish("model_data_loaded", {
                            resultSize: nodeArray.length
                        });
                    });
                }
                else {

                    courier.publish("view_flash", {
                        type: "warning",
                        message: "The search criteria you provided returned too many search results. Please refine your search."
                    });
                }
            }

            /***** public methods *****/

            this.makeLink = makeLink;
            this.breakLink = breakLink;
            this.updateLink = updateLink;

            this.getStats = getStats;

            this.loadData = loadData;

            this.getListViewModel = function(){

                return {
                    nodeArray: nodeArray
                };
            };

            this.getAdjacencyMatrixViewModel = function(sStart, sEnd, tStart, tEnd){

                return {
                    sNodeArray: getNodeArray(sStart, sEnd),
                    sNodeArrayDesc: getNodeArray(sStart, sEnd, true),
                    tNodeArray: getNodeArray(tStart, tEnd),
                    linkGridArray: getLinkGridArray(sStart, sEnd, tStart, tEnd),
                    maxNodeTitleLength: getMaxNodeTitleLength()
                };
            };

            this.getSelectViewModel = function(nId){

                return {
                    node: nodeMap[nId],
                    links: nodeLinksMap[nId]
                };
            };
        };

        return function(config){
            return new NodeLinkModel(config);
        };
    }
);