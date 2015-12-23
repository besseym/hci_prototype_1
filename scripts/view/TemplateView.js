define(
    [
        "common",
        "view/View"
    ],
    function (common, View) {

        var TemplateView = function (config, parent) {

            var template,
                attributes = {
                    templateId: null
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                template = Handlebars.compile(document.getElementById(attributes.templateId).innerHTML);
            }

            /***** public methods *****/
            this.set = function(){

                parent.set.apply(parent, arguments);
                set.apply(this, arguments);
            };

            this.updateView = function(data){

                var view = parent.getView();
                view.html(template(data));
            };
        };

        return function(config){

            var parent = new View(config);
            TemplateView.prototype = parent;
            TemplateView.prototype.constructor = TemplateView;
            return new TemplateView(config, parent);
        };
    }
);