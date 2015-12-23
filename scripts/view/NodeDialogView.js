define(
    ["common", "dispatch", "view/View", "view/NodeDialogBtnView"],
    function (common, dispatch, View, NodeDialogBtnView) {

        var NodeDialogView = function (config, parent) {

            var actionBtnView;

            setup();

            function setup(){

                actionBtnView = new NodeDialogBtnView({selector: "#d-n-action-btns", templateId: "template-n-action-btns"});
            }

            /***** public methods *****/

            this.updateView = function(data){

                parent.updateView(data);
                actionBtnView.updateView(data);
            };
        };

        return function(config){

            var parent = new View(config);
            NodeDialogView.prototype = parent;
            NodeDialogView.prototype.constructor = NodeDialogView;
            return new NodeDialogView(config, parent);
        };
    }
);