define(
    [
        "common",
        "dispatch"
    ],

    function (common, dispatch) {

        var FormView = function (config) {

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

                        dispatch.publish( attributes.topicSubmit, form.serializeArray());
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
            return new FormView(config);
        };
    }
);