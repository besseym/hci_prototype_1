define(
    ["common", "courier", "domJqueryImpl"],
    function (common, courier, domImpl) {

        var FlashView = function (config) {

            var attributes = {
                    selector: null
                },
                container = null,
                btnClose = null;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                container = $(attributes.selector);
                if (container.length > 0){

                    btnClose = container.find("#flash-btn-close");
                    btnClose.on("click", function(){
                        hide();
                    });
                }
                else {
                    throw "Unable to find view container.";
                }
            }

            function update(data){

                var type = "info";
                if(data.type !== undefined){
                    type = data.type;
                }

                container.removeClass("alert-success")
                    .removeClass("alert-warning")
                    .removeClass("alert-info")
                    .removeClass("alert-danger");


                container.addClass("alert-" + type);

                domImpl.updateText({
                    "flash-msg": data.message
                }, container);
            }

            function show(){
                container.css("display", "block");
            }

            function hide(){
                container.css("display", "none");
            }

            /***** public methods *****/
            this.update = update;
            this.show = show;
            this.hide = hide;
        };

        return function(config){
            return new FlashView(config);
        };
    }
);