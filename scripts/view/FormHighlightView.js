define(
    ["common", "dispatch", "domUtil"],

    function (common, dispatch, domUtil) {

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

                        dispatch.publish("view_form_highlight_title", {
                            title: inputTitle.val().toLowerCase()
                        });
                    });

                    inputTitle = form.find("#input-filter-title");
                    $('#form-hightlight input[name=property]:radio').change(function(event) {

                        var category = $(this).val();
                        dispatch.publish("view_form_highlight_property", {
                            category: category
                        });
                    });
                }
                else {
                    throw "Unable to find form.";
                }
            }

            function updateView(data){

                domUtil.updateText({"filter-title-count" : data.title.count}, form);
            }

            /***** public methods *****/

            this.set = set;

            this.updateView = updateView;

        };

        return function(config){
            return new FormHighlightView(config);
        };
    }
);