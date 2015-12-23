define(
    [
        "common",
        "dispatch",
        "view/TemplateView"
    ],

    function (common, dispatch, TemplateView) {

        var ItemListView = function (config, parent) {

            var attributes = {
                },
                itemTable,
                itemBtnTemplate;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                itemBtnTemplate = Handlebars.compile(document.getElementById("template-list-item-btns").innerHTML);
            }

            function getItemTable(){

                var view = parent.getView();

                if(itemTable === undefined){
                    itemTable = view.find("#table-list-widget");
                }

                return itemTable;
            }

            function updateItems(data, updateConnections, updateActionBtns){

                var i, node, itemView;

                for(i = 0; i < data.nodeArray.length; i++){

                    node = data.nodeArray[i];
                    itemView = getItemTable().find("#" + node.nId);

                    if(updateConnections){
                        itemView.find(".ll-connections").text(node.connections);
                    }

                    if(updateActionBtns){
                        itemView.find(".ll-btns").html(itemBtnTemplate(node));
                    }
                }

                if(updateActionBtns){

                    getItemTable().find(".list-btn-select").on("click", function(event){

                        var nId = $(this).data("node-id");

                        dispatch.publish("view_select_node", {
                            nId: nId
                        });

                        event.preventDefault();
                    });

                    getItemTable().find(".list-btn-link").on("click", function(event){

                        var id = $(this).data("id");

                        dispatch.publish("view_update_selected_link", {
                            id: id
                        });

                        event.preventDefault();
                    });
                }
            }

            function highlight(highlights){

                var k, hValue, selectResult, count, property,
                    view = parent.getView();

                //reset everything first
                selectResult = view.find('tbody tr');
                selectResult.css({'opacity': 1.0, 'font-weight': 'normal'});
                selectResult.find(".list-video-btn").css({color: null, 'background-color': null});

                for(k in highlights){

                    hValue = highlights[k];

                    switch(k) {

                        case 'selectedNode':

                            if(hValue !== undefined) {

                                selectResult = view.find("tbody tr#n-" + hValue.id);
                                selectResult.css({'font-weight': 900});
                            }

                            break;

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

            this.highlight = highlight;
            this.updateItems = updateItems;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.updateView = function(data){

                itemTable = undefined;

                parent.updateView(data);
                updateItems(data, false, true);
            };

        };

        return function(config){
            var parent = new TemplateView(config);
            ItemListView.prototype = parent;
            ItemListView.prototype.constructor = ItemListView;
            return new ItemListView(config, parent);
        };
    }
);