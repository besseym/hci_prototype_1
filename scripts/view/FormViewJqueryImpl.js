define(
    ["common", "courier"],

    function (common, courier) {

        var FormViewImpl = function (config) {

            var form = null,
                attributes = {
                    selector: null,
                    topicSubmit: null
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                form = $(attributes.selector);
                if (form.length > 0){

                    form.on("submit", function(){

                        courier.publish( attributes.topicSubmit, form.serializeArray());
                        event.preventDefault();
                    });
                }
                else {
                    throw "Unable to find form.";
                }
            }

            /***** public methods *****/

            this.set = set;

        };

        return function(config){
            return new FormViewImpl(config);
        };
    }
);