requirejs.config({
    paths: {
        d3: "/hci_prototype_1/bower_components/d3/d3.min"
    }
});

require(
    [
        "common",
        "dispatch",
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
        "chart1/ChartAdjacencyMatrixView",
        "chart1/ChartAdjMatrixWindowView"
    ],
    function (
        common,
        dispatch,
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
        ChartAdjacencyMatrixView,
        ChartAdjMatrixWindowView
    ) {

        var nodeLinkModel = new NodeLinkModel(),

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
            ),
            adjMatrixWindowView = ChartAdjMatrixWindowView({selector: "#chart-matrix-window"});

        adjMatrixWindowView.setPaddingAll(25);

        dispatch.subscribe("view_flash", function(msg){

            flashView.update(msg.payload);
            flashView.show();
        });

        dispatch.subscribe("view_form_submit_search", function(msg){

            nodeLinkModel.loadData(msg.payload);
        });

        dispatch.subscribe("model_data_loaded", function(msg){

            var padding,
                listViewModel = nodeLinkModel.getListViewModel(),
                adjacencyMatrixViewModel;

            nodeLinkModel.set({sStart: 0, sEnd: 7, tStart: 0});
            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();

            formTabbedView.focusTabNav("highlight");
            formTabbedView.focusTabPane("highlight");
            contentSwapView.swapContent("viz");

            resultView.updateView(nodeLinkModel.getResultViewModel());

            listViewModel.selectedNodeId = nodeLinkModel.get("selectedNodeId");
            itemListView.updateView(listViewModel);

            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            padding = adjacencyMatrixView.get("paddingLeft");
            adjMatrixWindowView.set({
                width: padding, height: padding
            });

            adjMatrixWindowView.updateScale();
            adjMatrixWindowView.draw();
        });

        dispatch.subscribe("view_form_highlight_title", function(msg){

            var highlightViewMode = highlightFormView.getHighlightViewModel(),
                stats = nodeLinkModel.getStatsViewModel(highlightViewMode);

            highlightFormView.updateView(stats);

            itemListView.highlight(stats);
            adjacencyMatrixView.highlight(stats);
        });

        dispatch.subscribe("view_form_highlight_property", function(msg){

            var highlightViewMode = highlightFormView.getHighlightViewModel(),
                stats = nodeLinkModel.getStatsViewModel(highlightViewMode);

            chartUtil.decorateWithColor(stats.property);

            colorKeyView.updateView(stats.property);

            itemListView.highlight(stats);
            adjacencyMatrixView.highlight(stats);
        });

        dispatch.subscribe("view_select_node", function(msg){

            var nId = msg.payload.nId,
                highlightViewMode = highlightFormView.getHighlightViewModel();

            nodeLinkModel.set({selectedNodeId: nId});
            stats = nodeLinkModel.getStatsViewModel(highlightViewMode);

            selectView.updateView(nodeLinkModel.getSelectViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), false, true);

            formTabbedView.focusTabNav("select");
            formTabbedView.focusTabPane("select");

            itemListView.highlight(stats);
            adjacencyMatrixView.highlight(stats);
        });

        dispatch.subscribe("view_update_selected_link", function(msg){

            nodeLinkModel.updateSelectedLink(msg.payload.id);
        });

        dispatch.subscribe("view_update_link", function(msg){

            nodeLinkModel.updateLink(msg.payload);
        });

        dispatch.subscribe("model_update_link_success", function(msg){

            var nodeLink, listViewModel, sNodeId, tNodeId,
                lId = nodeLinkModel.getLinkId(msg.payload.sId, msg.payload.tId);

            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), true, true);

            if(!nodeLinkModel.hasLink(lId)){
                selectView.removeLink(lId);
            }
            else {
                sNodeId = nodeLinkModel.getNodeId(msg.payload.sId);
                tNodeId = nodeLinkModel.getNodeId(msg.payload.tId);
                nodeLink = nodeLinkModel.getNodeLink(sNodeId, tNodeId);
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
            itemListView.updateItems(nodeLinkModel.getListViewModel(), true, true);
        });
    }
);