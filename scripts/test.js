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
        "view/KeyboardView",
        "view/FlashView",
        "view/QuickInfoView",
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
        "chart1/ChartNodeLinkView",
        "chart1/ChartAdjacencyMatrixView",
        "chart1/ChartAdjMatrixWindowView"
    ],
    function (
        common,
        dispatch,
        NodeLinkModel,
        KeyboardView,
        FlashView,
        QuickInfoView,
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
        ChartNodeLinkView,
        ChartAdjacencyMatrixView,
        ChartAdjMatrixWindowView
    ) {

        var nodeLinkModel = new NodeLinkModel(),

            keyboardView = new KeyboardView(),

            flashView = new FlashView({selector: "#flash"}),
            //loadingView = new LoadingView({selector: "#flash"}),
            matrixInfoView = new QuickInfoView({selector: "#m-info"}),

            colorKeyView = new ColorKeyView({selector: "#key-color", templateId: "template-color-key"}),

            searchFormView = new FormView({selector: "#form-search", topicSubmit: "view_form_submit_search"}),
            highlightFormView = new FormHighlightView({selector: "#form-hightlight"}),

            resultView = new ResultView({selector: "#view-result"}),

            formTabbedView = new TabbedViewImpl({selector: "#tabs-dialog"}),
            vizTabbedView = new TabbedViewImpl({selector: "#tabs-viz"}),
            contentSwapView = new ContentSwapView({selector: "#content-main"}),

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
                adjacencyMatrixViewModel, nodeLinkViewModel;

            //nodeLinkModel.set({sStart: 0, sEnd: 7, tStart: 0});
            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            nodeLinkViewModel = nodeLinkModel.getNodeLinkViewModel();

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

            chartNodeLinkView.updateScale(nodeLinkViewModel);
            chartNodeLinkView.updateView(nodeLinkViewModel);
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

            if(!msg.payload.withKey) {
                matrixInfoView.hide();
            }
        });

        dispatch.subscribe("view_chart_mouseout_link", function(msg){

            selectView.highlightLink(msg.payload.lId, false);

        });

        dispatch.subscribe("view_select_remove_link", function(msg){

            nodeLinkModel.breakLink(msg.payload.lId);
            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
            itemListView.updateItems(nodeLinkModel.getListViewModel(), true, true);
        });

        dispatch.subscribe("view_keyboard_left", function(msg){

            nodeLinkModel.move("left");

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_up", function(msg){

            nodeLinkModel.move("up");

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_right", function(msg){

            nodeLinkModel.move("right");

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_down", function(msg){

            nodeLinkModel.move("down");

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_zoom", function(msg){

            var adjacencyMatrixViewModel;

            nodeLinkModel.zoom();

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });

        dispatch.subscribe("view_keyboard_expand", function(msg){

            nodeLinkModel.expand();

            adjMatrixWindowView.set(nodeLinkModel.getAdjMatrixWindowViewModel());
            adjMatrixWindowView.draw();

            adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();
            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);

            highlightMatrix();
        });
    }
);