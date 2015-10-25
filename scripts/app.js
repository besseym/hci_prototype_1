requirejs.config({
    paths: {
        d3: '/hci_prototype_1/bower_components/d3/d3.min'
    }
});

require(
    [
        "common", "chart/chartUtil", "chart/DataNodeLink", "chart/WidgetItemList", "chart/ChartNodeLink", "chart/ChartAdjMatrixD3Impl"
    ],
    function(common, chartUtil, DataNodeLink, WidgetItemList, ChartNodeLink, ChartAdjMatrix) {

        var selectedNodeId,

            p,
            parameterMap = common.getParameterMap(),
            task = {
                isEnabled: false,
                id: 0
            },

            activeChart = "list",
            titleFilter = "",
            typeColorArray,

            dataNodeLink,
            listWidget,
            nodeLinkChart,
            adjMatrixChart,

            highlights = {},

            infoMatrix = $('#info-matrix'),

            titleFilterCount = $('#filter-title-count'),
            inputTitleFilter = $('#input-filter-title'),
            inputHighlightSelect = $('#form-hightlight input[name=highlight]:radio'),

            waitFeedback = $("#wait-feedback"),

            propertyColorKey = $("#key-color"),

            flashSuccess = $("#flash-success"),
            flashSuccessCloseBtn = flashSuccess.find("#btn-close-success"),
            flashSuccessMsg = flashSuccess.find("#flash-success-msg"),

            flashInfo = $("#flash-info"),
            flashInfoCloseBtn = flashInfo.find("#btn-close-info"),
            flashInfoMsg = flashInfo.find("#flash-info-msg"),

            flashWarning = $("#flash-warning"),
            flashWarningCloseBtn = flashWarning.find("#btn-close-warning"),
            flashWarningMsg = flashWarning.find("#flash-warning-msg"),

            flashDanger = $("#flash-danger"),
            flashDangerCloseBtn = flashDanger.find("#btn-close-danger"),
            flashDangerMsg = flashDanger.find("#flash-danger-msg"),

            nodeDialog = $("#n-dialog"),
            nodeDialogSelectBtn = nodeDialog.find("#d-n-select-btn"),
            nodeDialogThisToSelectedBtn = nodeDialog.find("#d-n-this-to-selected-btn"),
            nodeDialogSelectedToThisBtn = nodeDialog.find("#d-n-selected-to-this-btn"),

            linkDialog = $("#l-dialog"),
            linkDialogBtn = linkDialog.find("#l-btn"),

            highlightTabPane = $("#tab-pane-highlight"),
            resultCount = highlightTabPane.find("#result-count"),

            selectTabPane = $("#tab-pane-select"),
            connectionTableBody = selectTabPane.find("#s-n-c-tbl tbody");

        //intialize
        if(!common.isUndefined(parameterMap)){

            for(p in parameterMap){

                switch(p){

                    case 'task':

                        if(parameterMap[p] === '1'){

                            task.isEnabled = true;
                            task.id = 1;
                            task.href = '/hci_prototype_1/task_success_1.html';
                        }
                        else if(parameterMap[p] === '2'){

                            task.isEnabled = true;
                            task.id = 2;
                            task.href = '/hci_prototype_1/task_success_2.html';
                        }
                        else if(parameterMap[p] === '3'){

                            task.isEnabled = true;
                            task.id = 3;
                            task.href = '/hci_prototype_1/task_success_3.html';
                        }
                        else {
                            task.isEnabled = false;
                        }

                        break;
                }
            }
        }

        $( "#form-search" ).submit(function( event ) {

            var isMatch = false,
                graph,
                formArray = $( this ).serializeArray();

            waitFeedback.show();

            jQuery.each( formArray, function( i, field ) {

                if(field.name === "showId"){

                    switch(field.value){

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
                else if(field.name === "seriesId"){

                    switch(field.value){

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
                else if(field.name === "keywords"){

                    switch(field.value){

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

                $('#content-viz').show();
                $('#content-overview').hide();

                chartUtil.loadNodeLinkData(graph, function(error, data) {

                    if (error) throw error;

                    if(!common.isUndefined(nodeLinkChart)){
                        nodeLinkChart.clear();
                    }

                    if(!common.isUndefined(adjMatrixChart)){
                        adjMatrixChart.clear();
                    }

                    dataNodeLink = DataNodeLink.getInstance(data);

                    resultCount.text(dataNodeLink.getNodeCount());
                    focusHighlightTab();

                    loadListWidget();
                    loadNodeLinkChart();
                    loadAdjMatrixChart();

                    if("list" === activeChart) {
                        listWidget.display();
                    }
                    else if("nodeLink" === activeChart) {
                        nodeLinkChart.display();
                    }
                    else if("matrix" === activeChart){
                        adjMatrixChart.display();
                    }

                    waitFeedback.hide();
                });
            }
            else {

                waitFeedback.hide();

                showWarningMsg("The search criteria you provided returned too many search results. Please refine your search.");
            }

            event.preventDefault();
        });

        $("#form-hightlight").submit(function( event ) {
            event.preventDefault();
        });

        $("a[href='#tab-pane-list']").on("shown.bs.tab", function( event ) {

            listWidget.display();
            listWidget.highlight(highlights);

            infoMatrix.hide();

            activeChart = "list";
        });

        $("a[href='#tab-pane-node-link']").on("shown.bs.tab", function( event ) {

            nodeLinkChart.display();
            nodeLinkChart.highlight(highlights);

            nodeLinkChart.focusOnNode(selectedNodeId);

            infoMatrix.hide();

            activeChart = "nodeLink";
        });

        $("a[href='#tab-pane-matrix']").on("shown.bs.tab", function( event ) {

            adjMatrixChart.display();
            adjMatrixChart.highlight(highlights);
            adjMatrixChart.selectNode(selectedNodeId);

            infoMatrix.show();

            activeChart = "matrix";
        });

        function loadListWidget(){

            listWidget = WidgetItemList.getInstance({
                selector: "#list-widget",
                data: dataNodeLink,

                app: {

                    getSelectedNodeId: function(){
                        return selectedNodeId;
                    },
                    selectNode: selectNode,
                    makeLink: makeLink,
                    breakLink: breakLink,
                    showDangerMsg: showDangerMsg
                }
            });
        }

        function loadNodeLinkChart(){

            nodeLinkChart = ChartNodeLink.getInstance({

                selector: "#chart-graph-video",
                data: dataNodeLink,

                app: {

                    selectNode: selectNode,

                    makeLink: makeLink,
                    breakLink: breakLink,

                    focusSelectTab: focusSelectTab,
                    buildSelectPanel: buildSelectPanel,

                    populateNodeDialog: populateNodeDialog,
                    setNodeDialogLocation: setNodeDialogLocation,
                    hideNodeDialog: hideNodeDialog,

                    populateLinkDialog: populateLinkDialog,
                    setLinkDialogLocation: setLinkDialogLocation,
                    hideLinkDialog: hideLinkDialog
                }
            });
        }

        function loadAdjMatrixChart(){

            adjMatrixChart = ChartAdjMatrix.getInstance({
                selector: "#chart-matrix-video",
                data: dataNodeLink,
                padding: {
                    top: 250, right: 0, bottom: 0, left: 250
                },

                app: {
                    getSelectedNodeId: function(){
                        return selectedNodeId;
                    },
                    selectNode: selectNode,
                    changeSelectedLinkColor: changeSelectedLinkColor,
                    makeLink: makeLink,
                    breakLink: breakLink,
                    showDangerMsg: showDangerMsg
                }
            });
        }

        inputHighlightSelect.change(function(event) {

            var value = $(this).val();

            typeColorArray = chartUtil.getTypeColorArray(value, dataNodeLink);

            highlights.property = {
                typeColorArray: typeColorArray
            };

            if("list" === activeChart) {
                listWidget.highlight(highlights);
            }
            else if("matrix" === activeChart){
                adjMatrixChart.highlight(highlights);
            }
            else if("nodeLink" === activeChart) {
                nodeLinkChart.highlight(highlights);
            }

            propertyColorKey.show();
            buildColorKey(typeColorArray);
        });

        inputTitleFilter.on('input', function(event) {

            titleFilter = $(this).val().toLowerCase();

            highlights.title = {
                value: titleFilter
            };

            if("list" === activeChart) {
                listWidget.highlight(highlights);
            }
            else if("nodeLink" === activeChart) {
                nodeLinkChart.highlight(highlights);
            }
            else if("matrix" === activeChart){
                adjMatrixChart.highlight(highlights);
            }

            titleFilterCount.text(highlights.title.count);
            titleFilterCount.show();

        });

        function selectNode(sNodeId){

            if(dataNodeLink.hasNode(sNodeId)) {

                buildSelectPanel(dataNodeLink.getNode(sNodeId), dataNodeLink.getNodeConnect(sNodeId));
                focusSelectTab();

                selectedNodeId = sNodeId;
            }
        }

        //node dialog actions
        nodeDialogSelectBtn.on('click', function( event ) {

            selectedNodeId = nodeDialog.find("#n-d-id").text();

            selectNode(selectedNodeId);

            nodeLinkChart.focusOnNode(selectedNodeId);

            event.preventDefault();
        });

        nodeDialogThisToSelectedBtn.on('click', function( event ) {

            var nodeId = nodeDialog.find("#n-d-id").text();
            nodeLinkChart.makeLink(selectedNodeId, nodeId);

            event.preventDefault();
        });

        nodeDialogSelectedToThisBtn.on('click', function( event ) {

            var nodeId = nodeDialog.find("#n-d-id").text();
            nodeLinkChart.makeLink(nodeId, selectedNodeId);

            event.preventDefault();
        });

        //link dialog actions
        linkDialogBtn.on('click', function( event ) {

            var id = $(this).attr('href');
            nodeLinkChart.breakLink(id);

            event.preventDefault();
        });

        linkDialogBtn.on("mouseover", function() {

            $(this).children('i').removeClass( "fa-link" ).addClass( "fa-chain-broken" );
        });

        linkDialogBtn.on("mouseout", function() {

            $(this).children('i').removeClass( "fa-chain-broken" ).addClass( "fa-link" );
        });

        flashSuccessCloseBtn.on("click", function(event){

            flashSuccess.css("display", "none");
            event.preventDefault();
        });

        flashInfoCloseBtn.on("click", function(event){

            flashInfo.css("display", "none");
            event.preventDefault();
        });

        flashWarningCloseBtn.on("click", function(event){

            flashWarning.css("display", "none");
            event.preventDefault();
        });

        flashDangerCloseBtn.on("click", function(event){

            flashDanger.css("display", "none");
            event.preventDefault();
        });

        function populateNodeDialog(d){

            var hasSelected = !common.isUndefined(selectedNodeId),
                isSelectedNode = selectedNodeId === d.id,
                isThisConnectedToSelected,
                isSelectedConnectedToThis,
                selectBlk, thisToSelectedBlk, selectedToThisBlk;

            nodeDialog.find("#n-d-id").text(d.id);
            nodeDialog.find("#n-d-title").text(d.title);
            nodeDialog.find("#n-d-type").text(d.type);

            nodeDialog.find("#n-d-series-id").text(d.seriesId);
            nodeDialog.find("#n-d-season-number").text(d.seasonNumber);
            nodeDialog.find("#n-d-show-id").text(d.showId);

            if(hasSelected && !isSelectedNode){
                isThisConnectedToSelected = dataNodeLink.isConnected(selectedNodeId, d.id);
                isSelectedConnectedToThis = dataNodeLink.isConnected(d.id, selectedNodeId);
            }

            selectBlk = nodeDialog.find("#d-n-select");
            if(!hasSelected || !isSelectedNode ){
                selectBlk.css("display", "block");
            }
            else {
                selectBlk.css("display", "none");
            }

            thisToSelectedBlk = nodeDialog.find("#d-n-this-to-selected");
            selectedToThisBlk = nodeDialog.find("#d-n-selected-to-this");
            if(hasSelected && !isSelectedNode){

                if(!isThisConnectedToSelected) {
                    thisToSelectedBlk.css("display", "block");
                }
                else {
                    thisToSelectedBlk.css("display", "none");
                }

                if(!isSelectedConnectedToThis) {
                    selectedToThisBlk.css("display", "block");
                }
                else {
                    selectedToThisBlk.css("display", "none");
                }
            }
            else {

                thisToSelectedBlk.css("display", "none");
                selectedToThisBlk.css("display", "none");
            }
        }

        function setNodeDialogLocation(location){

            nodeDialog.css("left", location.left).css("top", location.top).css("visibility", "visible");
        }

        function hideNodeDialog(){

            nodeDialog.css("visibility", "hidden");
        }

        function populateLinkDialog(d){

            linkDialog.find("#source").text(d.source.title);
            linkDialog.find("#target").text(d.target.title);

            linkDialog.find("#l-btn").attr("href", d.id);
        }

        function setLinkDialogLocation(location){

            linkDialog.css("left", location.left).css("top", location.top).css("visibility", "visible");
        }

        function hideLinkDialog(){

            linkDialog.css("visibility", "hidden");
        }

        function changeSelectedLinkColor(lId, doHighlight){

            var lRow = connectionTableBody.find("#s-" + lId);

            if (lRow.length > 0 ){

                if(doHighlight){
                    lRow.addClass("bg-info");
                }
                else {
                    lRow.removeClass("bg-info");
                }
            }
        }

        function buildSelectPanel(d, connect){

            var j,
                sortStartIndex,
                connection,
                connectionLinkArray,
                connectionBtnArray,
                connectOutArray = [];

            selectTabPane.find("#s-n-title").text(d.title);

            selectTabPane.find("#s-n-id").text(d.id);
            selectTabPane.find("#s-n-type").text(d.type);

            selectTabPane.find("#s-n-series-id").text(d.seriesId);
            selectTabPane.find("#s-n-season-number").text(d.seasonNumber);
            selectTabPane.find("#s-n-show-id").text(d.showId);

            selectTabPane.find("#s-n-url a").attr('href', d.url);

            connectionTableBody.empty();

            //console.log(connect);
            if(!common.isUndefined(connect)){

                for(j = 0; j < connect.connectionArray.length; j++){

                    connection = connect.connectionArray[j];

                    connectOutArray = [
                        "<tr id='s-" + connection.l.id + "' data-link-id='" + connection.l.id + "' data-source-id='" + connection.l.source.id + "' data-target-id='" + connection.l.target.id + "' class='s-l'>",
                        "<td>",
                        "<i class='fa fa-bars'></i>",
                        "</td>",
                        "<td>",
                        connection.n.title,
                        "</td>",
                        "<td>",
                        connection.n.type,
                        "</td>",
                        "<td>",
                        connection.n.rating,
                        "</td>",
                        "<td>",
                        "<a class='s-l-btn btn btn-lg btn-default' href='" + connection.l.id + "'>",
                        "<i class='fa fa-link'></i>",
                        "</a>",
                        "</td>",
                        "</tr>"
                    ];

                    connectionTableBody.append(connectOutArray.join(""));
                }
            }

            connectionTableBody.sortable({
                cursor: "move",
                opacity: 0.5,
                start: function( event, ui ) {

                    sortStartIndex = ui.item.index();
                },
                update: function( event, ui ) {

                    var sortEndIndex = ui.item.index(),
                        sNodeId = ui.item.data('source-id'),
                        tNodeId = ui.item.data('target-id');

                    if(task.isEnabled && task.id === 3 && selectedNodeId === 'n-32392' && tNodeId === 'n-32412' && sortEndIndex === 0){

                        $(location).attr('href', task.href);
                    }

                    if("nodeLink" === activeChart) {
                        nodeLinkChart.adjustLinkWeight(sNodeId, sortStartIndex, sortEndIndex);
                    }
                    else if("matrix" === activeChart){
                        adjMatrixChart.adjustLinkWeight(sNodeId, sortStartIndex, sortEndIndex);
                    }

                }
            });

            connectionLinkArray = connectionTableBody.find('.s-l');
            connectionLinkArray.on("mouseover", function() {

                var link = $(this),
                    lId = link.data('link-id'),
                    targetId = link.data('target-id');

                changeSelectedLinkColor(lId, true);

                if("nodeLink" === activeChart) {
                    nodeLinkChart.changeLinkColor(lId, true);
                }
                else if("matrix" === activeChart){
                    adjMatrixChart.changeLinkColor(lId, true);
                }
                //else if("list" === activeChart){
                //    listWidget.updateTargetView(targetId, true);
                //}

            });

            connectionLinkArray.on("mouseout", function() {

                var link = $(this),
                    lId = link.data('link-id'),
                    targetId = link.data('target-id');

                changeSelectedLinkColor(lId, false);

                if("nodeLink" === activeChart) {
                    nodeLinkChart.changeLinkColor(lId, false);
                }
                else if("matrix" === activeChart){
                    adjMatrixChart.changeLinkColor(lId, false);
                }
                //else if("list" === activeChart){
                //    listWidget.updateTargetView(targetId, false);
                //}
            });

            connectionBtnArray = connectionTableBody.find('.s-l-btn');
            connectionBtnArray.on("mouseover", function() {

                $(this).children('i').removeClass( "fa-link" ).addClass( "fa-chain-broken" );
            });

            connectionBtnArray.on("mouseout", function() {

                $(this).children('i').removeClass( "fa-chain-broken" ).addClass( "fa-link" );
            });

            connectionBtnArray.on("click", function(event){

                var id = $(this).attr('href');

                if("nodeLink" === activeChart) {
                    nodeLinkChart.breakLink(id);
                }
                else if("matrix" === activeChart){
                    adjMatrixChart.breakLink(id);
                }
                else if("list" === activeChart){
                    listWidget.breakLink(id);
                }

                event.preventDefault();
            });
        }

        function makeLink(sId, tId){

            if(task.isEnabled && task.id === 2 && sId === 'n-20804' && tId === 'n-20805'){

                $(location).attr('href', task.href);
            }
        }

        function breakLink(lId){

            var connectionRow;

            if(task.isEnabled && task.id === 1 && lId === 'l-n-22813-n-22951'){

                $(location).attr('href', task.href);
            }

            connectionRow = connectionTableBody.find("#s-" + lId);

            if(connectionRow.length > 0){
                connectionRow.remove();
            }
        }

        function buildColorKey(typeColorArray){

            var i, typeColor, keyColorList, outArray, c;

            if(typeColorArray !== null){

                keyColorList = $("#key-color .list-group");
                keyColorList.empty();

                for(i = 0; i < typeColorArray.length; i++){

                    typeColor = typeColorArray[i];
                    //typeColor.color;

                    c = 0;
                    if(!common.isUndefined(typeColor.count)){
                        c = typeColor.count;
                    }

                    outArray = [
                        "<li class='list-group-item'>",
                        "<svg height='15' width='15'>",
                        "<rect width='15' height='15' fill='",
                        typeColor.color,
                        "' />",
                        "</svg> ",
                        typeColor.name,
                        " - ",
                        "<span class='type-highlight-count'>",
                        c,
                        " videos",
                        "</span>",
                        "</li>"];

                    keyColorList.append(outArray.join(""));
                }
            }
        }

        function focusSearchTab() {

            $('#tabs-dialog a[href="#tab-pane-search"]').tab('show');
        }

        function focusHighlightTab() {

            $('#nav-tab-hightlight').css("visibility", "visible");
            $('#tabs-dialog a[href="#tab-pane-highlight"]').tab('show');
        }

        function focusSelectTab() {

            $('#nav-tab-select').css("visibility", "visible");
            $('#tabs-dialog a[href="#tab-pane-select"]').tab('show');
        }

        function hideSelectTab() {

            $('#nav-tab-select').css("visibility", "hidden");
        }

        function focusVizContent() {

            $('#content-overview').css("display", "none");
            $('#content-viz').css("display", "block");
            $('#content-matrix').css("display", "none");
        }

        function focusMatrixContent() {

            $('#content-overview').css("display", "none");
            $('#content-viz').css("display", "none");
            $('#content-matrix').css("display", "block");
        }

        function showSuccessMsg(msg){
            flashSuccessMsg.text(msg);
            flashSuccess.css("display", "block");
        }

        function showInfoMsg(msg){
            flashInfoMsg.text(msg);
            flashInfo.css("display", "block");
        }

        function showWarningMsg(msg){
            flashWarningMsg.text(msg);
            flashWarning.css("display", "block");
        }

        function showDangerMsg(msg){
            flashDangerMsg.text(msg);
            flashDanger.css("display", "block");
        }

    }
);
