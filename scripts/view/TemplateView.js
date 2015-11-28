define(["common"],
    function (common) {

        var TemplateView = function (config) {

            var view,
                template,
                attributes = {
                    selector: null,
                    templateId: null
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                view = $(attributes.selector);
                if (view.length > 0){

                    template = Handlebars.compile(document.getElementById(attributes.templateId).innerHTML);
                    //Mustache.parse(template); // optional, speeds up future uses
                }
                else {
                    throw "Unable to find view.";
                }
            }

            function updateView(data){

                view.html(template(data));
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.getView = function(){
                return view;
            };

            this.updateView = updateView;
        };

        return function(config){
            return new TemplateView(config);
        };
    }
);