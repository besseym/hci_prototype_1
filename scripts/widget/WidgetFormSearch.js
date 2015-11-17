define(["common"],

    function (common) {

        var WidgetFormSearch = function (config) {

            var attr = {
                id: null
            };

            set(config);

            function set(config){
                common.setAttributes(config, attr);
            }

            function get(key){
                return common.getAttribute(key, attr);
            }

            /***** public methods *****/

            this.set = set;

            this.get = get;

        };

        return function(config){
            return new WidgetFormSearch(config);
        };
    }
);