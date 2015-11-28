define(
    ["common", "courier"],

    function (common, courier) {

        var FormHighlightView = function (config) {

            var form,
                inputTitle,
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

                    inputTitle = form.find("#input-filter-title");
                    inputTitle.on('input', function(event) {

                        courier.publish("view_form_highlight_filter_title", {
                            title: inputTitle.val().toLowerCase()
                        });
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
            return new FormHighlightView(config);
        };
    }
);