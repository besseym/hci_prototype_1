define(
    [
        "common",
        "dispatch",
        "domUtil"
    ],
    function (common, dispatch, domUtil) {

        var LoadingView = function (config) {

            var attributes = {
                    selector: null
                },
                container = null;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                container = $(attributes.selector);
                if (container.length > 0){

                }
                else {
                    throw "Unable to find view container.";
                }
            }

            /***** public methods *****/

            this.set = set;
        };

        return function(config){
            return new LoadingView(config);
        };
    }
);