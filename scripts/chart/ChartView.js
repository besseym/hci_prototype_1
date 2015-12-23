define(
    [
        "common",
        "dispatch"
    ],

    function (common, dispatch) {

        var ChartView = function (config) {

            var view = null,
                attributes = {
                    selector: null,
                    exists: false,
                    width: 100,
                    height: 100,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,

                    get rangeX() {
                        return [this.paddingLeft, this.width - this.paddingRight];
                    },

                    get rangeY() {
                        return [this.height - this.paddingBottom, this.paddingTop];
                    }
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function get(){
                return common.getAttributes(arguments, attributes);
            }

            function setup(){

                view = document.querySelector(attributes.selector);
                if (view !== undefined){
                }
                else {
                    throw "Unable to find view.";
                }
            }

            /***** public methods *****/

            this.set = set;
            this.get = get;

            this.setPadding = function(padding){

                if("top" in padding){
                    attributes.paddingTop = padding.top;
                }

                if("right" in padding){
                    attributes.paddingRight = padding.right;
                }

                if("bottom" in padding){
                    attributes.paddingBottom = padding.bottom;
                }

                if("left" in padding){
                    attributes.paddingLeft = padding.left;
                }
            };

            this.setPaddingAll = function(padding){

                attributes.paddingTop = padding;
                attributes.paddingRight = padding;
                attributes.paddingBottom = padding;
                attributes.paddingLeft = padding;
            };

            this.getView = function(){
                return view;
            };

        };

        return function(config){
            return new ChartView(config);
        };
    }
);