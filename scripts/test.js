requirejs.config({
    paths: {
        d3: '/hci_prototype_1/bower_components/d3/d3.min'
    }
});

require(
    [
        "common",
        "courier",
        "model/NodeLinkModel",
        "model/HighlightModel",
        "view/FlashView",
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

        courier.subscribe( "view_form_highlight_filter_title", function(msg){

            var highlights;

            highlightModel.set( msg.payload );
            highlights = highlightModel.getHighlights();

            itemListView.highlight(highlights);
            adjacencyMatrixView.highlight(highlights);
        });

        courier.subscribe( "view_select_node", function(msg){

            var nId = msg.payload.nId;

            console.log( nodeLinkModel.getSelectViewModel(nId) );

            selectView.updateView(nodeLinkModel.getSelectViewModel(nId));

            formTabbedView.focusTabNav("select");
            formTabbedView.focusTabPane("select");
        });

        courier.subscribe( "view_update_link", function(msg){

            nodeLinkModel.updateLink(msg.payload.sId, msg.payload.tId);
            adjacencyMatrixView.updateView(nodeLinkModel.getAdjacencyMatrixViewModel());
        });
    }
);