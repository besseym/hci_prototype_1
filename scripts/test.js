requirejs.config({
    paths: {
        d3: "/hci_prototype_1/bower_components/d3/d3.min"//,
        //colorbrewer: "/hci_prototype_1/bower_components/colorbrewer/colorbrewer"
    }
});

require(
    [
        "common",
        "courier",
        "model/NodeLinkModel",
        "model/HighlightModel",
        "view/FlashView",
        "view/LoadingView",
        "view/ColorKeyView",
        "view/FormViewJqueryImpl",
        "view/FormHighlightView",
        "view/TabbedViewJqueryImpl",
        "view/ContentSwapView",
        "view/SelectView",
        "view/ItemListView",
        "chart1/ChartAdjacencyMatrixView"
    ],
    function (
        common,
        courier,
        NodeLinkModel,
        HighlightModel,
        FlashView,
        LoadingView,
        ColorKeyView,
        FormViewImpl,
        FormHighlightView,
        TabbedViewImpl,
        ContentSwapView,
        SelectView,
        ItemListView,
        ChartAdjacencyMatrixView
    ) {

        var nodeLinkModel = new NodeLinkModel(),
            highlightModel = new HighlightModel(),

            flashView = new FlashView({selector: "#flash"}),
            //loadingView = new LoadingView({selector: "#flash"}),
            colorKeyView = new ColorKeyView({selector: "#key-color", templateId: "template-color-key"}),

            searchFormView = new FormViewImpl({selector: "#form-search", topicSubmit: "view_form_submit_search"}),
            highlightFormView = new FormHighlightView({selector: "#form-hightlight"}),

            formTabbedView = new TabbedViewImpl({selector: "#tabs-dialog"}),
            vizTabbedView = new TabbedViewImpl({selector: "#tabs-viz"}),
            contentSwapView = new ContentSwapView({selector: "#content-main"}),

            selectView = new SelectView({selector: "#tab-pane-select", templateId: "template-select"}),

            itemListView = new ItemListView({selector: "#list-widget", templateId: "template-item-list"}),
            adjacencyMatrixView = ChartAdjacencyMatrixView(
                {
                    selector: "#chart-matrix-video",
                    paddingLeft: 200
                });

        courier.subscribe( "view_flash", function(msg){

            flashView.update(msg.payload);
            flashView.show();
        });

        courier.subscribe( "view_form_submit_search", function(msg){

            nodeLinkModel.loadData(msg.payload);
        });

        courier.subscribe( "model_data_loaded", function(msg){

            var adjacencyMatrixViewModel = nodeLinkModel.getAdjacencyMatrixViewModel();

            formTabbedView.focusTabNav("highlight");
            formTabbedView.focusTabPane("highlight");
            contentSwapView.swapContent("viz");

            itemListView.updateView(nodeLinkModel.getListViewModel());

            adjacencyMatrixView.updateScale(adjacencyMatrixViewModel);
            adjacencyMatrixView.updateView(adjacencyMatrixViewModel);
        });

        courier.subscribe( "view_form_highlight_title", function(msg){

            var highlightViewModel;

            highlightModel.set( msg.payload );
            highlightViewModel = highlightModel.getHighlightViewModel();

            itemListView.highlight(highlightViewModel);
            adjacencyMatrixView.highlight(highlightViewModel);
        });

        courier.subscribe( "view_form_highlight_property", function(msg){

            var highlightViewModel,
                stats = nodeLinkModel.getStats(msg.payload.category);

            highlightModel.set({stats: stats});
            highlightViewModel = highlightModel.getHighlightViewModel();

            colorKeyView.updateView(highlightModel.getColorKeyViewModel());
            adjacencyMatrixView.highlight(highlightViewModel);
        });

        courier.subscribe( "view_select_node", function(msg){

            var nId = msg.payload.nId;

            selectView.updateView(nodeLinkModel.getSelectViewModel(nId));

            formTabbedView.focusTabNav("select");
            formTabbedView.focusTabPane("select");
        });

        courier.subscribe( "view_update_link", function(msg){

            nodeLinkModel.updateLink(msg.payload.sId, msg.payload.tId);
            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
        });

        courier.subscribe( "view-hover-link", function(msg){

            //console.log(msg.payload);
        });
    }
);