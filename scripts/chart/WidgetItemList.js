define(["common"], function (common) {

    //start
    var WidgetItemList = function (config) {

        var frame,
            exists,
            data,
            tblBody;

        set(config);

        function updateLinkCount(nId){

            var connect = data.getNodeConnect(nId),
                linkCount =  0, countContainer;

            if(!common.isUndefined(connect)){
                linkCount = connect.connectionArray.length;
            }

            countContainer = tblBody.find("#" + nId).find(".list-link-count");
            countContainer.empty();
            countContainer.text(linkCount);
        }

        function updateDisplay(){

            var nId, nodeRow,

                selectedNodeId = config.app.getSelectedNodeId(),
                nodeRowSelection = tblBody.find("tr"),
                actionBtnContainer;

            nodeRowSelection.each(function(i, l){

                nodeRow = $(l);
                nId = nodeRow.attr('id');

                actionBtnContainer = nodeRow.find(".list-node-btns");
                actionBtnContainer.empty();
                actionBtnContainer.append(getActionBtns(selectedNodeId, nId));
            });

            setupActionBtns();
        }

        function selectNode(selectedNodeId) {

            var nodeRowSelection = tblBody.find("tr");

            config.app.selectNode(selectedNodeId);

            nodeRowSelection.css("font-weight", "normal");
            tblBody.find("#" + selectedNodeId).css("font-weight", "bold");

            updateDisplay();
        }

        function getActionBtns(selectedNodeId, nId){

            var actionBtns = "",
                isSelected = false,
                hasSelected = !common.isUndefined(selectedNodeId);

            if (hasSelected) {
                isSelected = selectedNodeId === nId;

                if(!isSelected){

                    if(!data.isConnected(selectedNodeId, nId)){
                        actionBtns = "<a class='btn btn-default btn-primary list-btn-connect' href='" + nId + "' role='button'><i class='fa fa-chain'></i></a>";
                        actionBtns += "&nbsp";
                    }

                    actionBtns += "<a class='btn btn-default list-btn-select' href='" + nId + "' role='button'><i class='fa fa-check'></i></a>";
                }
            }
            else {
                actionBtns = "<a class='btn btn-default btn-primary list-btn-select' href='" + nId + "' role='button'><i class='fa fa-check'></i></a>";
            }

            return actionBtns;
        }

        function setupActionBtns(){

            tblBody.find('.list-btn-select').on("click", function(event){

                var nId = $(this).attr('href');
                selectNode(nId);

                event.preventDefault();
            });

            tblBody.find('.list-btn-connect').on("click", function(event){

                var nId, selectedNodeId = config.app.getSelectedNodeId();

                if(common.isUndefined(selectedNodeId)){
                    return;
                }

                nId = $(this).attr('href');

                makeLink(selectedNodeId, nId);

                event.preventDefault();
            });
        }

        function makeLink(sourceId, targetId){

            config.app.makeLink(sourceId, targetId);

            link = data.makeLink(sourceId, targetId);
            config.app.selectNode(sourceId);

            updateLinkCount(sourceId);

            updateDisplay();
        }

        this.highlight = function(highlights){

            var k, highlight, selectResult;

            //reset everything first
            selectResult = tblBody.find('tr');
            selectResult.css({'opacity': 1.0});
            selectResult.find(".list-video-btn").css({color: null, 'background-color': null});

            for(k in highlights){

                switch(k){

                    case 'title':

                        highlight = highlights.title;

                        if(highlight.value !== ""){
                            selectResult = tblBody.find("tr:not([data-title*='" + highlight.value + "'])");
                            selectResult.css({'opacity': 0.2});
                            highlight.count = data.getNodeCount() - selectResult.length;
                        }
                        else {
                            highlight.count = 0;
                        }

                        break;

                    case 'property':

                        highlight = highlights.property;

                        for(i = 0; i < highlight.typeColorArray.length; i++){

                            h = highlight.typeColorArray[i];
                            selectResult = tblBody.find("tr." + h.id);
                            h.count = selectResult.length;
                            selectResult.find(".list-video-btn").css({color: 'white', 'background-color': h.color});
                            //selectResult.css({'color': h.color});
                        }

                        break;
                }
            }
        };

        this.display = function(){

            var selectedNodeId, hasSelected, isSelected,
                node, nodeArray, connect, connectionCount,
                listOut = "", listOutArray, c,
                actionBtns, actionBtnOutArray, actionSelectBtnArray, actionConnectBtnArray;

            if(!exists){
                return;
            }

            reset();

            nodeArray = data.get('nodes');
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

            selectedNodeId = config.app.getSelectedNodeId();
            hasSelected = !common.isUndefined(selectedNodeId);

            for(i = 0; i < nodeArray.length; i++){
                node = nodeArray[i];

                c = node.class;

                if(hasSelected && selectedNodeId === node.id){

                    c += " selectedNode";
                }

                actionBtnOutArray = [
                    "<td class='list-node-btns'>",
                    getActionBtns(selectedNodeId, node.id),
                    "</td>"
                ];

                connectionCount = 0;
                connect = data.getNodeConnect(node.id);
                if(!common.isUndefined(connect)){
                    connectionCount = connect.connectionArray.length;
                }

                listOutArray = [
                    "<tr id='" + node.id + "' class='" + c + "' data-title='" + node.titleFilter + "'>",
                    "<td>",
                    "<a class='btn btn-default list-video-btn' href='" + node.url + "' target='_blank'> <i class='fa fa-play-circle-o'></i> </a>",
                    "</td>",
                    "<td>",
                    node.id,
                    "</td>",
                    "<td>",
                    node.threePartKey,
                    "</td>",
                    "<td>",
                    node.title,
                    "</td>",
                    "<td class='list-link-count'>",
                    connectionCount,
                    "</td>",
                    actionBtnOutArray.join(""),
                    "</tr>"
                ];

                listOut += listOutArray.join("");
            }

            tblBody.append(listOut);

            setupActionBtns();

        };

        function reset(){

            if(exists){
                tblBody.empty();
            }
        }

        this.reset = function(){

            reset();
        };

        function breakLink (lId){

            var link = data.removeLink(lId);

            config.app.breakLink(lId);
            updateTargetView(link.target.id, false);
            updateLinkCount(link.source.id);
            updateDisplay();
        }

        this.breakLink = function(lId){

            breakLink(lId);
        };

        function updateTargetView(targetId, doHighlight){

            if(doHighlight){
                tblBody.find("tr#" + targetId + " td").addClass('bg-info');
            }
            else {
                tblBody.find("tr#" + targetId + " td").removeClass('bg-info');
            }
        }

        this.updateTargetView = function(targetId, doHighlight){
            updateTargetView(targetId, doHighlight);
        };

        function set(config) {

            if (!common.isUndefined(config)) {

                if (!common.isUndefined(config.selector)) {

                    frame = $(config.selector);
                    exists = frame.length > 0;

                    if(exists){
                        tblBody = frame.find("#table-list-widget tbody");
                    }
                }

                if (!common.isUndefined(config.data)) {
                    data = config.data;
                }
            }
        }

        function get(key){

            var value = null;

            return value;
        }

        //public setter
        this.set = function(config){

            set(config);
        };

        //public getter
        this.get = function(key){

            var value = get(key);

            return value;
        };

    };

    return {

        getInstance: function(config) {
            return new WidgetItemList(config);
        }
    };
});