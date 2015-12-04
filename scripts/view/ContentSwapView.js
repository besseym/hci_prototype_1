define(
    ["common", "dispatch"],

    function (common, dispatch) {

        var ContentSwapView = function (config) {

            var container = null,
                contentArray = null,
                attributes = {
                    selector: null
                };

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                container = document.querySelector(attributes.selector);
                if (container !== undefined){

                    contentArray = container.querySelectorAll(".content");
                }
                else {
                    throw "Unable to find container.";
                }
            }

            /***** public methods *****/

            this.set = set;
            this.swapContent = function(id){

                var i = 0,
                    content,
                    selectedContent,
                    contentId = "content-" + id;

                for(i = 0; i < contentArray.length; i++){

                    content = contentArray[i];
                    if(content.id === contentId){
                        selectedContent = content;
                        break;
                    }
                }

                if(selectedContent !== undefined) {

                    for (i = 0; i < contentArray.length; i++) {

                        content = contentArray[i];
                        if (content.id !== selectedContent.id) {
                            content.style.display = "none";
                        }
                    }

                    selectedContent.style.display = "block";
                }
            };
        };

        return function(config){
            return new ContentSwapView(config);
        };
    }
);