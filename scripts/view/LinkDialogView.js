define(
    [
        "common",
        "dispatch",
        "view/View"
    ],
    function (common, dispatch, View) {

        var LinkDialogView = function (config, parent) {

            var linkBtn;

            setup();

            function setup(){

                var view = parent.getView();

                linkBtn = view.find("#l-btn");
                if (linkBtn.length > 0){

                    linkBtn.on('click', function(event) {

                        var lId = linkBtn.data("link-id");

                        dispatch.publish("view_remove_link", {
                            lId: lId
                        });

                        event.preventDefault();
                    });
                }

            }

            /***** public methods *****/

            this.updateView = function(data){

                linkBtn.data("link-id", data.lId);
                parent.updateView(data);
            };
        };

        return function(config){

            var parent = new View(config);
            LinkDialogView.prototype = parent;
            LinkDialogView.prototype.constructor = LinkDialogView;
            return new LinkDialogView(config, parent);
        };
    }
);