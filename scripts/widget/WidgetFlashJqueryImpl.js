define(["common", "widget/WidgetFlash"],

    function (common, WidgetFlash) {

        var WidgetFlashImpl = function (config, parent) {

            attr(config);

            function attr(config){

                var widget,
                    widgetMsg,
                    widgetBtnClose;

                if(config.id){

                    widget = $(config.id);
                    widgetMsg = widget.find("#flash-msg");
                    widgetBtnClose = widget.find("#flash-btn-close");
                    parent.attr({widget: widget, widgetMsg: widgetMsg});

                    widgetBtnClose.on("click", function(){
                        hide();
                    });
                }
            }

            function show(){
                parent.get('widget').css("display", "block");
            }

            function hide(){
                parent.get('widget').css("display", "none");
            }

            function updateWidget(message){

                var type = parent.attr('type'),
                    widget = parent.attr('widget'),
                    widgetMsg = parent.attr('widgetMsg');

                widget.removeClass("alert-success")
                    .removeClass("alert-warning")
                    .removeClass("alert-info")
                    .removeClass("alert-danger");

                widget.addClass("alert-" + type);

                widgetMsg.text(message);
            }

            /***** public methods *****/

            this.show = show;
            this.hide = hide;

            this.updateWidget = updateWidget;
        };

        return function(config){

            var parent = new WidgetFlash(config);
            WidgetFlashImpl.prototype = parent;
            WidgetFlashImpl.prototype.constructor = WidgetFlashImpl;
            return new WidgetFlashImpl(config, parent);
        };
    }
);