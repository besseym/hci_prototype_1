define(["common"],
    function (common) {

        var WidgetFlash = function (config) {

            var attributes = {
                id: null,
                _type: "success",

                widget: null,
                widgetMsg: null,

                get type() {
                    return this._type;
                },

                set type(v) {

                    if(v === "success" || v === "danger" || v === "warning" || v === "info") {
                        this._type = v;
                    }
                }
            };

            attr(config);

            function attr(){
                return common.attr(arguments, attributes);
            }

            /***** public methods *****/

            this.attr = attr;
        };

        return function(config){
            return new WidgetFlash(config);
        };
    }
);