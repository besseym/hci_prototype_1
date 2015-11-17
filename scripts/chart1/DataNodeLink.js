define(["common"],

    function (common) {

        //start
        var DataNodeLink = function (config) {

            var attr = {
                nodeArray: [],
                nodeMap: [],
                linkArray: [],
                linkMap: []
            };

            set(config);

            function addNode(node){

                node.nId = 'n-' + node.id;

                attr.nodeMap[node.nId] = node;
                attr.nodeArray.push(node);
            }

            function addLink(link){

                return makeLink(attr.nodeArray[link.source], attr.nodeArray[link.target], link.weight);
            }

            function makeLink(sNode, tNode, weight){

                var link = {
                    lId: 'l-' + sNode.id + "-" + tNode.id,
                    source: sNode,
                    target: tNode,
                    weight: weight
                };

                attr.linkMap[link.lId] = link;
                attr.linkArray.push(link);
            }

            function set(config){

                var i, n, l;

                if(config.nodes) {

                    for(i = 0; i < config.nodes.length; i++){

                        n = config.nodes[i];
                        addNode(n);
                    }
                }

                if(config.links) {

                    for(i = 0; i < config.links.length; i++){

                        l = config.links[i];
                        addLink(l);
                    }
                }
            }

            function get(key){
                return attr[key];
            }

            /***** public methods *****/

            this.set = set;

            this.get = get;

        };

        return function(config){
            return new DataNodeLink(config);
        };
    }
);
