define(
    [
        "common",
        "domUtil"
    ],
    function (common, domUtil) {

        var View = function (config) {

            var attributes = {
                    selector: null,
                    isRemoveable: false
                },
                view;

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

            this.getView = function(){
                return view;
            };

            this.show = function(){

                if(attributes.isRemoveable) {
                    view.css("display", "block");
                }
                else {
                    view.css("visibility", "visible");
                }
            };

            this.hide = function(){

                if(attributes.isRemoveable) {
                    view.css("display", "none");
                }
                else {
                    view.css("visibility", "hidden");
                }
            };

            this.setLocation = function(location){

                view.css("left", location.x).css("top", location.y);
            };
        };

        return function(config){
            return new View(config);
        };
    }
);