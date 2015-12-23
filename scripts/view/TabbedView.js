define(
    [
        "common",
        "dispatch"
    ],
    function (common, dispatch) {

        var TabbedView = function (config) {

            var attributes = {
                    selector: null
                },
                container = null;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup() {

                container = $(attributes.selector);
                if (container.length > 0){

                    container.find(".nav-tab").on("shown.bs.tab", function( event ) {

                        var navTab = $(this),
                            tab = $(this).attr("href").replace(/#|-/g, "_");

                        dispatch.publish("view" + tab, {});
                    });
                }
                else {
                    throw "Unable to find container.";
                }
            }

            function focusTabNav(id) {
                $("#nav-tab-" + id).css("visibility", "visible");
            }

            function focusTabPane(id) {
                container.find("a[href='#tab-pane-" + id + "']").tab('show');
            }

            /***** public methods *****/

            this.focusTabNav = focusTabNav;
            this.focusTabPane = focusTabPane;

        };

        return function(config){
            return new TabbedView(config);
        };
    }
);