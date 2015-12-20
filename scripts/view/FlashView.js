define(
    ["common", "dispatch", "domUtil", "view/View"],

    function (common, dispatch, domUtil, View) {

        var FlashView = function (config, parent) {

            var attributes = {
                },
                btnClose = null;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                var view = parent.getView();

                btnClose = view.find("#flash-btn-close");
                btnClose.on("click", function(){
                    parent.hide();
                });
            }

            function updateView(data){

                var type = "info",
                    view = parent.getView();


                if(data.type !== undefined){
                    type = data.type;
                }

                view.removeClass("alert-success")
                    .removeClass("alert-warning")
                    .removeClass("alert-info")
                    .removeClass("alert-danger");


                view.addClass("alert-" + type);

                parent.updateView({
                    "flash-msg": data.message
                });
            }

            /***** public methods *****/

            this.updateView = updateView;
        };

        return function(config){

            var parent = new View(config);
            FlashView.prototype = parent;
            FlashView.prototype.constructor = FlashView;
            return new FlashView(config, parent);
        };
    }
);