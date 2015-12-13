requirejs.config({
    paths: {
        d3: "/hci_prototype_1/bower_components/d3/d3.min"//,
        //colorbrewer: "/hci_prototype_1/bower_components/colorbrewer/colorbrewer"
    }
});

require(
    [
        "common",
        "dispatch",
        "model/AppModel",
        "model/NodeLinkModel",
        "view/FlashView",
        "view/LoadingView",
        "view/ColorKeyView",
        "view/FormView",
        "view/ResultView",
        "view/FormHighlightView",
        "view/TabbedViewJqueryImpl",
        "view/ContentSwapView",
        "view/SelectView",
        "view/ItemListView",
        "chart1/chartUtil",
        "chart1/ChartAdjacencyMatrixView"
    ],
    function (
        common,
        dispatch,
        AppModel,
        NodeLinkModel,
        FlashView,
        LoadingView,
        ColorKeyView,
        FormView,
        ResultView,
        FormHighlightView,
        TabbedViewImpl,
        ContentSwapView,
        SelectView,
        ItemListView,
        chartUtil,
        ChartAdjacencyMatrixView
    ) {

        var appModel = new AppModel(),
            nodeLinkModel = new NodeLinkModel(),

            flashView = new FlashView({selector: "#flash"}),
            //loadingView = new LoadingView({selector: "#flash"}),
            colorKeyView = new ColorKeyView({selector: "#key-color", templateId: "template-color-key"}),

            searchFormView = new FormView({selector: "#form-search", topicSubmit: "view_form_submit_search"}),
            highlightFormView = new FormHighlightView({selector: "#form-hightlight"}),

            resultView = new ResultView({selector: "#view-result"}),

            formTabbedView = new TabbedViewImpl({selector: "#tabs-dialog"}),
            vizTabbedView = new TabbedViewImpl({selector: "#tabs-viz"}),
            contentSwapView = new ContentSwapView({selector: "#content-main"}),

            selectView = new SelectView({selector: "#tab-pane-select", templateId: "template-select"}),

            itemListView = new ItemListView({selector: "#list-widget", templateId: "template-item-list"}),
            adjacencyMatrixView = ChartAdjacencyMatrixView(
                {
                    selector: "#chart-matrix-video",
                    paddingLeft: 200
                }
            );

        dispatch.subscribe("view_flash", function(msg){

            flashView.update(msg.payload);
            flashView.show();
        });

        dispatch.subscribe("view_form_submit_search", function(msg){

            nodeLinkModel.loadData(msg.payload);
        });

        dispatch.subscribe("model_data_loaded", function(msg){

            var listViewModel = nodeLinkModel.getListViewModel(),
                adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();

            formTabbedView.focusTabNav("highlight");
            formTabbedView.focusTabPane("highlight");
            contentSwapView.swapContent("viz");

            resultView.updateView(nodeLinkModel.getResultViewModel());

            listViewModel.selectedNodeId = appModel.get("selectedNodeId");
            itemListView.updateView(listViewModel);

            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);
        });

        dispatch.subscribe("view_form_highlight_title", function(msg){

            var stats = nodeLinkModel.getStats(msg.payload);

            highlightFormView.updateView(stats);

            itemListView.highlight(stats);
            adjacencyMatrixView.highlight(stats);
        });

        dispatch.subscribe("view_form_highlight_property", function(msg){

            var stats = nodeLinkModel.getStats(msg.payload);

            chartUtil.decorateWithColor(stats.property);

            colorKeyView.updateView(stats.property);

            itemListView.highlight(stats);
            adjacencyMatrixView.highlight(stats);
        });

        dispatch.subscribe("view_select_node", function(msg){

            var nId = msg.payload.nId,
                listViewModel = nodeLinkModel.getListViewModel(nId),
                selectViewModel = nodeLinkModel.getSelectViewModel(nId);

            appModel.set({selectedNodeId: nId});

            selectView.updateView(selectViewModel);
            itemListView.updateItems(listViewModel, false, true);

            formTabbedView.focusTabNav("select");
            formTabbedView.focusTabPane("select");
        });

        dispatch.subscribe("view_update_link", function(msg){

            var nodeLink, listViewModel,
                lId = nodeLinkModel.getLinkId(msg.payload.sId, msg.payload.tId);

            nodeLinkModel.updateLink(msg.payload.sId, msg.payload.tId);

            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), true, false);

            if(!nodeLinkModel.hasLink(lId)){
                selectView.removeLink(lId);
            }
            else {
                nodeLink = nodeLinkModel.getNodeLink(msg.payload.sNodeId, msg.payload.tNodeId);
                selectView.addLink(nodeLink);
            }
        });

        dispatch.subscribe("view_select_mouseover_link", function(msg){

            var link = nodeLinkModel.getLink(msg.payload.lId);
            adjacencyMatrixView.highlightLink(link, true);
        });

        dispatch.subscribe("view_select_mouseout_link", function(msg){

            var link = nodeLinkModel.getLink(msg.payload.lId);
            adjacencyMatrixView.highlightLink(link, false);
        });

        dispatch.subscribe("view_chart_mouseover_link", function(msg){

            selectView.highlightLink(msg.payload.lId, true);
        });

        dispatch.subscribe("view_chart_mouseout_link", function(msg){

            selectView.highlightLink(msg.payload.lId, false);
        });

        dispatch.subscribe("view_select_remove_link", function(msg){

            nodeLinkModel.breakLink(msg.payload.lId);
            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
        });
    }
);