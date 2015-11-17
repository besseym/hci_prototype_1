requirejs.config({
    paths: {
        d3: '/hci_prototype_1/bower_components/d3/d3.min'
    }
});

require(
    [
        "common", "chart/chartUtil", "chart1/DataNodeLink", "widget/WidgetFlashJqueryImpl"
    ],
    function(common, chartUtil, DataNodeLink, WidgetFlashImpl) {

        var graph = "graph_robots.json";

        chartUtil.loadNodeLinkData(graph, function(error, data) {

            if (error) throw error;

            var dataNodeLink = new DataNodeLink(data),
                widgetFlash = WidgetFlashImpl({id: "#flash", type: "danger"});

            console.log(widgetFlash.attr('type'));

            widgetFlash.updateWidget("This is my message.");
        });

    }
);