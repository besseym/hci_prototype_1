define(
    ["common", "courier", "view/TemplateView"],

    function (common, courier, TemplateView) {

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

                    courier.publish("view-hover-link", {
                        lId: lId
                    });
                });

                linkArray.on("mouseout", function() {

                });

                linkBtnArray.on("mouseover", function() {

                    $(this).children('i').removeClass( "fa-link" ).addClass( "fa-chain-broken" );
                });

                linkBtnArray.on("mouseout", function() {

                    $(this).children('i').removeClass( "fa-chain-broken" ).addClass( "fa-link" );
                });
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
        };

        return function(config){

            var parent = new TemplateView(config);
            SelectView.prototype = parent;
            SelectView.prototype.constructor = SelectView;
            return new SelectView(config, parent);
        };
    }
);