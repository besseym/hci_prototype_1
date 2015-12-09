define(
    ["common", "dispatch", "view/TemplateView"],

    function (common, dispatch, TemplateView) {

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

                var k, hValue, selectResult, count, property,
                    view = parent.getView();

                //reset everything first
                selectResult = view.find('tbody tr');
                selectResult.css({'opacity': 1.0});
                selectResult.find(".list-video-btn").css({color: null, 'background-color': null});

                for(k in highlights){

                    hValue = highlights[k];

                    switch(k) {

                        case 'title':

                            if(!common.isBlankStr(hValue.value)){

                                selectResult = view.find("tbody tr:not([data-title*='" + hValue.value + "'])");
                                selectResult.css({'opacity': 0.2});
                            }

                            break;

                        case 'property':

                            for(i = 0; i < hValue.properties.length; i++){

                                property = hValue.properties[i];
                                selectResult = view.find("tr." + hValue.category.prefix + property.name);
                                selectResult.find(".list-video-btn").css({color: 'white', 'background-color': property.color});
                            }

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