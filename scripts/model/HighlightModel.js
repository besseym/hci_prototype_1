define(["common"],
    function (common) {

        var HighlightModel = function (config) {

            var attributes = {
                    title: null
                };

            set(config);

            function set(){
                common.setAttributes(arguments, attributes);
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.getHighlights = function(){

                return {
                    title: attributes.title
                };
            };
        };

        return function(config){
            return new HighlightModel(config);
        };
    }
);