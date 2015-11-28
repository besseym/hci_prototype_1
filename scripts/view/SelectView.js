define(["common", "view/TemplateView"],
    function (common, TemplateView) {

        var SelectView = function (config, parent) {

            var attributes = {
            };

            set(config);

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function updateView(data){

            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.updateView = function(data){

                parent.updateView(data);
                updateView(data);
            };
        };

        return function(config){

            var parent = new TemplateView(config);
            SelectView.prototype = parent;
            SelectView.prototype.constructor = SelectView;
            return new SelectView(config, parent);
        };
    }
);