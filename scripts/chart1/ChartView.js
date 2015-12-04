define(
    ["common", "dispatch"],

    function (common, dispatch) {

        var ChartView = function (config) {

            var container = null,
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

                container = $(attributes.selector);
                if (container.length > 0){
                }
                else {
                    throw "Unable to find container.";
                }
            }

            /***** public methods *****/

            this.set = set;
            this.get = get;

        };

        return function(config){
            return new ChartView(config);
        };
    }
);