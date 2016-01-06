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
        "model/MatrixWindowModel",
        "view/View",
        "view/KeyboardView",
        "view/FlashView",
        "view/QuickInfoView",
        "view/LoadingView",
        "view/ColorKeyView",
        "view/FormView",
        "view/ResultView",
        "view/FormHighlightView",
        "view/TabbedView",
        "view/ContentSwapView",
        "view/SelectView",
        "view/NodeDialogView",
        "view/LinkDialogView",
        "view/ItemListView",
        "chart/chartUtil",
        "chart/ChartNodeLinkView",
        "chart/ChartAdjacencyMatrixView",
        "chart/ChartAdjMatrixWindowView"
    ],
    function (
        common,
        dispatch,
        NodeLinkModel,
        MatrixWindowModel,
        View,
        KeyboardView,
        FlashView,
        QuickInfoView,
        LoadingView,
        ColorKeyView,
        FormView,
        ResultView,
        FormHighlightView,
        TabbedView,
        ContentSwapView,
        SelectView,
        NodeDialogView,
        LinkDialogView,
        ItemListView,
        chartUtil,
        ChartNodeLinkView,
        ChartAdjacencyMatrixView,
        ChartAdjMatrixWindowView
    ) {

        var nodeLinkModel = new NodeLinkModel(),
            matrixWindowModel = MatrixWindowModel(),

            keyboardView = new KeyboardView(),

            flashView = new FlashView({selector: "#flash", isRemoveable: true}),
            loadingView = new View({selector: "#loading", isRemoveable: true}),
            matrixInfoView = new QuickInfoView({selector: "#m-info"}),

            colorKeyView = new ColorKeyView({selector: "#key-color", templateId: "template-color-key"}),

            searchFormView = new FormView({selector: "#form-search", topicSubmit: "view_form_submit_search"}),
            highlightFormView = new FormHighlightView({selector: "#form-hightlight"}),

            resultView = new ResultView({selector: "#view-result"}),

            formTabbedView = new TabbedView({selector: "#tabs-dialog"}),
            vizTabbedView = new TabbedView({selector: "#tabs-viz"}),
            contentSwapView = new ContentSwapView({selector: "#content-main"}),

            nodeDialogView = new NodeDialogView({selector: "#n-dialog"}),
            linkDialogView = new LinkDialogView({selector: "#l-dialog"}),

            selectView = new SelectView({selector: "#tab-pane-select", templateId: "template-select"}),

            itemListView = new ItemListView({selector: "#list-widget", templateId: "template-item-list"}),
            chartNodeLinkView = new ChartNodeLinkView({selector: "#chart-graph-video"}),
            adjacencyMatrixView = ChartAdjacencyMatrixView(
                {
                    selector: "#chart-matrix-video",
                    paddingLeft: 200
                }
            ),
            adjMatrixWindowView = ChartAdjMatrixWindowView({selector: "#chart-matrix-window"});

        adjMatrixWindowView.setPaddingAll(5);

        function highlightMatrix(){

            var highlightViewMode = highlightFormView.getHighlightViewModel(),
                stats = nodeLinkModel.getStatsViewModel(highlightViewMode);

            adjacencyMatrixView.highlight(stats);
        }

        dispatch.subscribe("view_loading_show", function(msg){

            loadingView.show();
        });

        dispatch.subscribe("view_loading_hide", function(msg){

            loadingView.hide();
        });

        function refreshMatrixCharts(){

            var windowModel = matrixWindowModel.getViewModel(),
                adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();

            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel, windowModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            adjMatrixWindowView.set(windowModel);

            adjMatrixWindowView.updateScale();
            adjMatrixWindowView.draw();
        }

        dispatch.subscribe("view_tab_pane_matrix", function(msg){

            var padding;

            adjacencyMatrixView.updateDimensions();

            padding = adjacencyMatrixView.get("paddingLeft");
            adjMatrixWindowView.set({
                width: padding, height: padding
            });

            refreshMatrixCharts();
        });

        dispatch.subscribe("view_tab_pane_node_link", function(msg){

            var nodeLinkViewModel = nodeLinkModel.getNodeLinkViewModel();

            chartNodeLinkView.updateScale(nodeLinkViewModel);
            chartNodeLinkView.updateView(nodeLinkViewModel);
        });

        dispatch.subscribe("view_flash", function(msg){

            flashView.updateView(msg.payload);
            flashView.show();
        });

        dispatch.subscribe("view_form_submit_search", function(msg){

            nodeLinkModel.loadData(msg.payload);

        });

        dispatch.subscribe("model_data_loaded", function(msg){

            var nodeNumber = nodeLinkModel.getNodeNumber(),
                listViewModel = nodeLinkModel.getListViewModel();

            matrixWindowModel.set({xMax: nodeNumber, yMax: nodeNumber});

            formTabbedView.focusTabNav("highlight");
            formTabbedView.focusTabPane("highlight");
            contentSwapView.swapContent("viz");

            resultView.updateView(nodeLinkModel.getResultViewModel());

            listViewModel.selectedNodeId = nodeLinkModel.get("selectedNodeId");
            itemListView.updateView(listViewModel);

        });

        dispatch.subscribe("view_form_highlight_title", function(msg){

            var highlightViewMode = highlightFormView.getHighlightViewModel(),
                statsViewModel = nodeLinkModel.getStatsViewModel(highlightViewMode);

            highlightFormView.updateView(statsViewModel);

            itemListView.highlight(statsViewModel);
            adjacencyMatrixView.highlight(statsViewModel);
            chartNodeLinkView.highlight(statsViewModel);
        });

        dispatch.subscribe("view_form_highlight_property", function(msg){

            var highlightViewMode = highlightFormView.getHighlightViewModel(),
                statsViewModel = nodeLinkModel.getStatsViewModel(highlightViewMode);

            chartUtil.decorateWithColor(statsViewModel.property);

            colorKeyView.updateView(statsViewModel.property);

            itemListView.highlight(statsViewModel);
            adjacencyMatrixView.highlight(statsViewModel);
            chartNodeLinkView.highlight(statsViewModel);
        });

        dispatch.subscribe("view_select_node", function(msg){

            var nId = msg.payload.nId, statsViewModel,
                highlightViewMode = highlightFormView.getHighlightViewModel();

            nodeLinkModel.set({selectedNodeId: nId});
            statsViewModel = nodeLinkModel.getStatsViewModel(highlightViewMode);

            selectView.updateView(nodeLinkModel.getSelectViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), false, true);

            formTabbedView.focusTabNav("select");
            formTabbedView.focusTabPane("select");

            itemListView.highlight(statsViewModel);
            adjacencyMatrixView.highlight(statsViewModel);
            chartNodeLinkView.highlight(statsViewModel);
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
            chartNodeLinkView.updateView(nodeLinkModel.getNodeLinkViewModel());
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
            chartNodeLinkView.highlightLink(link, true);
        });

        dispatch.subscribe("view_select_mouseout_link", function(msg){

            var link = nodeLinkModel.getLink(msg.payload.lId);
            adjacencyMatrixView.highlightLink(link, false);
            chartNodeLinkView.highlightLink(link, false);
        });

        dispatch.subscribe("view_chart_mouseover_link", function(msg){

            var matrixInfoViewModel;

            selectView.highlightLink(msg.payload.lId, true);

            if(msg.payload.withKey){

                matrixInfoViewModel = nodeLinkModel.getMatrixInfoViewModel(msg.payload);
                matrixInfoView.updateView(matrixInfoViewModel);
                matrixInfoView.show();
                matrixInfoView.setLocation(msg.payload.location);
            }
        });

        dispatch.subscribe("view_chart_mouseout_link", function(msg){

            selectView.highlightLink(msg.payload.lId, false);

            if(!msg.payload.withKey) {
                matrixInfoView.hide();
            }
        });

        dispatch.subscribe("view_remove_link", function(msg){

            var lId = msg.payload.lId;

            nodeLinkModel.breakLink(lId);
        });

        dispatch.subscribe("model_remove_link_success", function(msg){

            var lId = msg.payload.lId;

            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
            chartNodeLinkView.updateView(nodeLinkModel.getNodeLinkViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), true, true);

            selectView.removeLink(lId);
        });

        dispatch.subscribe("view_keyboard_left", function(msg){

            //nodeLinkModel.move("left");
            //
            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.move("left");

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_up", function(msg){

            //nodeLinkModel.move("up");
            //
            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.move("up");

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_right", function(msg){

            //nodeLinkModel.move("right");
            //
            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.move("right");

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_down", function(msg){

            //nodeLinkModel.move("down");
            //
            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.move("down");

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_zoom", function(msg){

            //var adjacencyMatrixViewModel;

            //nodeLinkModel.zoom();

            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.zoom();

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_expand", function(msg){

            //nodeLinkModel.expand();

            //adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            //adjMatrixWindowView.draw();
            //
            //adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            //adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            //adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            matrixWindowModel.expand();

            refreshMatrixCharts();

            highlightMatrix();
        });

        dispatch.subscribe("view_chart_node_link_click", function(msg){

            nodeDialogView.hide();
            linkDialogView.hide();
        });

        dispatch.subscribe("view_chart_node_link_mouseover_node", function(msg){

            var nodeDialogViewModel;

            linkDialogView.hide();

            if(!nodeLinkModel.isSelectedNodeId(msg.payload.nId)) {

                nodeDialogViewModel = nodeLinkModel.getNodeDialogViewModel(msg.payload);
                nodeDialogView.updateView(nodeDialogViewModel);

                nodeDialogView.setLocation(msg.payload);
                nodeDialogView.show();
            }
        });

        dispatch.subscribe("view_chart_node_link_mouseout_node", function(msg){

        });

        dispatch.subscribe("view_chart_node_link_mouseover_link", function(msg){

            var linkDialogViewModel = nodeLinkModel.getLinkDialogViewModel(msg.payload);

            nodeDialogView.hide();

            linkDialogView.setLocation(msg.payload);
            linkDialogView.show();
            linkDialogView.updateView(linkDialogViewModel);
        });
    }
);