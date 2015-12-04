define(
    [
        "common", "dispatch"
    ],
    function (common, dispatch) {

        var TabbedViewImpl = function (config) {

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
                if (container.length <= 0){
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
            return new TabbedViewImpl(config);
        };
    }
);