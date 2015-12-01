define(
    ["common", "courier"],

    function (common, courier) {

        var FormHighlightView = function (config) {

            var form,
                inputTitle,
                radioProperty,
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

                        courier.publish("view_form_highlight_title", {
                            title: inputTitle.val().toLowerCase()
                        });
                    });

                    inputTitle = form.find("#input-filter-title");
                    $('#form-hightlight input[name=property]:radio').change(function(event) {

                        var property = $(this).val();
                        courier.publish("view_form_highlight_property", {
                            property: property
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