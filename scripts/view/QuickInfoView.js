define(
    [
        "common",
        "view/View"
    ],
    function (common, View) {

        var QuickInfoView = function (config, parent) {

            var linkIcon;

            setup();

            function setup(){

                var view = parent.getView();

                linkIcon = view.find("#i-m-info-link");
            }

            /***** public methods *****/

            this.updateView = function(data){

                if(data.link.rank > 0){
                    linkIcon.removeClass( "fa-chain-broken" ).addClass( "fa-link" );
                }
                else {
                    linkIcon.removeClass( "fa-link" ).addClass( "fa-chain-broken" );
                }

                parent.updateView({
                    "m-info-rank": data.link.rank,
                    "source-title": data.link.source.title,
                    "target-title": data.link.target.title
                });
            };
        };

        return function(config){

            var parent = new View(config);
            QuickInfoView.prototype = parent;
            QuickInfoView.prototype.constructor = QuickInfoView;
            return new QuickInfoView(config, parent);
        };
    }
);