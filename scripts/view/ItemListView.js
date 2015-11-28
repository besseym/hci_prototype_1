define(
    ["common", "courier", "view/TemplateView"],

    function (common, courier, TemplateView) {

        var ItemListView = function (config, parent) {

            var attributes = {
            };

            set(config);

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function updateView(data){

            }

            function highlight(highlights){

                var k, highlightValue, selectResult, count,
                    view = parent.getView();

                //reset everything first
                selectResult = view.find('tbody tr');
                selectResult.css({'opacity': 1.0});
                selectResult.find(".list-video-btn").css({color: null, 'background-color': null});

                for(k in highlights){

                    highlightValue = highlights[k];
                    if(common.isBlankStr(highlightValue)){
                        continue;
                    }

                    switch(k) {

                        case 'title':
                            selectResult = view.find("tbody tr:not([data-title*='" + highlightValue + "'])");
                            selectResult.css({'opacity': 0.2});
                            break;
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

            this.highlight = highlight;

        };

        return function(config){
            var parent = new TemplateView(config);
            ItemListView.prototype = parent;
            ItemListView.prototype.constructor = ItemListView;
            return new ItemListView(config, parent);
        };
    }
);