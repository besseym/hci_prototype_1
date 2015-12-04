define(
    ["common", "dispatch", "view/TemplateView"],

    function (common, dispatch, TemplateView) {

        var SelectView = function (config, parent) {

            var attributes = {
            };

            set(config);

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function updateView(data){

                var view = parent.getView(),
                    linkTable = view.find("#s-n-c-tbl"),
                    linkArray = linkTable.find('.s-l');
                    linkBtnArray = linkTable.find('.s-l-btn');

                linkArray.on("mouseover", function() {

                    var link = $(this),
                        lId = link.data('link-id'),
                        targetId = link.data('target-id');

                    link.addClass("bg-info");

                    dispatch.publish("view_select_mouseover_link", {
                        lId: lId
                    });
                });

                linkArray.on("mouseout", function() {

                    var link = $(this),
                        lId = link.data('link-id');

                    link.removeClass("bg-info");

                    dispatch.publish("view_select_mouseout_link", {
                        lId: lId
                    });
                });

                linkBtnArray.on("mouseover", function() {

                    $(this).children('i').removeClass( "fa-link" ).addClass( "fa-chain-broken" );
                });

                linkBtnArray.on("mouseout", function() {

                    $(this).children('i').removeClass( "fa-chain-broken" ).addClass( "fa-link" );
                });

                linkBtnArray.on("click", function() {

                    var link = $(this),
                        lId = link.data('link-id');

                    dispatch.publish("view_select_remove_link", {
                        lId: lId
                    });
                });
            }

            function highlightLink(lId, doHighlight){

                var view = parent.getView(),
                    linkRow = view.find('#s-' + lId);

                if(linkRow.length > 0){

                    if(doHighlight){
                        linkRow.addClass("bg-info");
                    }
                    else {
                        linkRow.removeClass("bg-info");
                    }
                }
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.updateView = function(data){

                parent.updateView(data);
                updateView(data);
            };

            this.highlightLink = highlightLink;
        };

        return function(config){

            var parent = new TemplateView(config);
            SelectView.prototype = parent;
            SelectView.prototype.constructor = SelectView;
            return new SelectView(config, parent);
        };
    }
);