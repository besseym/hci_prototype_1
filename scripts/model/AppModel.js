define(["common"],
    function (common) {

        var AppModel = function (config) {

            var attributes = {
                selectedNodeId: undefined
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
        };

        return function(config){
            return new AppModel(config);
        };
    }
);