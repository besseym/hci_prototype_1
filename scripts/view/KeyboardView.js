define(
    ["common", "dispatch", "domUtil"],
    function (common, dispatch, domUtil) {

        var KeyboardView = function (config) {

            var attributes = {},
                keyMap = {left: 65, up: 87, right: 68, down: 83, zoom: 90, expand: 88};
            //keyMap = {left: 37, up: 38, right: 39, down: 40, zoom: 187, expand: 189};

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                var match = false;

                $(document).on('keyup', 'body', function(e) {

                    var match = false,
                        message_topic,
                        keyCode = e.keyCode || e.which;

                    match = false;

                    if(e.altKey){

                        switch (keyCode) {

                            case keyMap.left:

                                match = true;
                                message_topic = "view_keyboard_left";
                                break;

                            case keyMap.up:

                                match = true;
                                message_topic = "view_keyboard_up";
                                break;

                            case keyMap.right:

                                match = true;
                                message_topic = "view_keyboard_right";
                                break;

                            case keyMap.down:

                                match = true;
                                message_topic = "view_keyboard_down";
                                break;

                            case keyMap.zoom:

                                match = true;
                                message_topic = "view_keyboard_zoom";
                                break;

                            case keyMap.expand:

                                match = true;
                                message_topic = "view_keyboard_expand";
                                break;
                        }
                    }

                    if(match){

                        dispatch.publish(message_topic, {
                            match: match
                        });
                    }
                });
            }

            /***** public methods *****/
        };

        return function(config){
            return new KeyboardView(config);
        };
    }
);