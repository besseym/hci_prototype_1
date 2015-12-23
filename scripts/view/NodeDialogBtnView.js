define(
    ["common", "dispatch", "view/View", "view/TemplateView"],
    function (common, dispatch, View, TemplateView) {

        var NodeDialogBtnView = function (config, parent) {

            var connectThisToSelectedBtn,
                connectSelectedToThisBtn;

            setup();

            function setup(){
            }

            /***** public methods *****/

            this.updateView = function(data){

                var view = parent.getView();

                parent.updateView(data);

                connectThisToSelectedBtn = view.find("#d-n-this-to-selected-btn");
                if(connectThisToSelectedBtn.length > 0){

                    connectThisToSelectedBtn.data("node-id", data.nId);
                    connectThisToSelectedBtn.on("click", function(event){

                        dispatch.publish("view_update_link", {
                            sId: data.selectedNodeId,
                            tId: data.id
                        });

                        event.preventDefault();
                    });
                }

                connectSelectedToThisBtn = view.find("#d-n-selected-to-this-btn");
                if(connectSelectedToThisBtn.length > 0) {

                    connectSelectedToThisBtn.data("node-id", data.nId);
                    connectSelectedToThisBtn.on("click", function (event) {

                        dispatch.publish("view_update_link", {
                            sId: data.id,
                            tId: data.selectedNodeId
                        });

                        event.preventDefault();
                    });
                }
            };
        };

        return function(config){

            var parent = new TemplateView(config);
            NodeDialogBtnView.prototype = parent;
            NodeDialogBtnView.prototype.constructor = NodeDialogBtnView;
            return new NodeDialogBtnView(config, parent);
        };
    }
);