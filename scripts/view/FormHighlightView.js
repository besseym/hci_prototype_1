define(
    ["common", "dispatch", "domUtil"],

    function (common, dispatch, domUtil) {

        var FormHighlightView = function (config) {

            var form,
                inputTitle,
                attributes = {
                    selector: null,
                    topicSubmit: null,
                    currentTitle: undefined,
                    currentProperty: undefined
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

                        attributes.currentTitle = inputTitle.val().toLowerCase();
                        console.log(attributes.currentProperty);

                        dispatch.publish("view_form_highlight_title", {
                            property: attributes.currentProperty,
                            title: attributes.currentTitle
                        });
                    });

                    $("#form-hightlight input[name=property]").change(function(event) {

                        attributes.currentProperty = $(this).val();

                        dispatch.publish("view_form_highlight_property", {
                            property: attributes.currentProperty,
                            title: attributes.currentTitle
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

            this.getHighlightViewModel = function(){

                return {
                    property: attributes.currentProperty,
                    title: attributes.currentTitle
                };
            };

        };

        return function(config){
            return new FormHighlightView(config);
        };
    }
);