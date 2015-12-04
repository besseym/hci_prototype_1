define(
    ["common", "domUtil"],
    function (common, domUtil) {

        var View = function (config) {

            var attributes = {
                    selector: null
                },
                view = null;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                view = $(attributes.selector);
                if (view.length <= 0){
                    throw "Unable to find view.";
                }
            }

            function updateView(data){

                domUtil.updateText(data, view);
            }

            /***** public methods *****/

            this.set = set;
            this.updateView = updateView;
        };

        return function(config){
            return new View(config);
        };
    }
);