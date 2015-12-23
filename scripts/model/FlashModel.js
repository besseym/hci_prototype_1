define(["common"],
    function (common) {

        var FlashModel = function (config) {

            var attributes = {
                _message: null,
                _type: "success",

                get message() {
                    return this._message;
                },

                set message(v) {
                    this._message = v;
                },

                get type() {
                    return this._type;
                },

                set type(v) {

                    if(v === "success" || v === "danger" || v === "warning" || v === "info") {
                        this._type = v;
                    }
                }
            };

            set(config);

            function set(){
                common.setAttributes(arguments, attributes);
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };
        };

        return function(config){
            return new FlashModel(config);
        };
    }
);