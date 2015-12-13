define(
    ["common", "dispatch", "view/TemplateView"],

    function (common, dispatch, TemplateView) {

        var SelectView = function (config, parent) {

            var attributes = {
                },
                linkTable,
                linkTableBody,
                linkTemplate;

            set(config);
            setup();

            function set(){
                common.setAttributes(arguments, attributes);
            }

            function setup(){

                var view = parent.getView();
                linkTemplate = Handlebars.compile(document.getElementById("template-select-link").innerHTML);
            }

            function getLinkTable(){

                if(linkTable === undefined){
                    linkTable = parent.getView().find("#s-n-c-tbl");
                }

                return linkTable;
            }

            function getLinkTableBody(){

                if(linkTableBody === undefined){
                    linkTableBody = getLinkTable().find("tbody");
                }

                return linkTableBody;
            }

            function getLinkRow(lId){
                return getLinkTableBody().find("#s-" + lId);
            }

            function updateView(data){

                var i, nodeLink;

                for(i = 0; i < data.links.length; i++){
                    nodeLink = data.links[i];
                    addLink(nodeLink);
                }
            }

            function addLink(nodeLink){

                var linkRow, linkRowBtn,
                    linkHtml = linkTemplate(nodeLink);

                getLinkTableBody().append(linkHtml);
                linkRow = getLinkRow(nodeLink.l.lId);
                linkRowBtn = linkRow.find('.s-l-btn');

                linkRow.on("mouseover", function() {

                    var link = $(this),
                        lId = link.data('link-id');

                    link.addClass("bg-info");

                    dispatch.publish("view_select_mouseover_link", {
                        lId: lId
                    });
                });

                linkRow.on("mouseout", function() {

                    var link = $(this),
                        lId = link.data('link-id');

                    link.removeClass("bg-info");

                    dispatch.publish("view_select_mouseout_link", {
                        lId: lId
                    });
                });

                linkRowBtn.on("mouseover", function() {

                    $(this).children('i').removeClass( "fa-link" ).addClass( "fa-chain-broken" );
                });

                linkRowBtn.on("mouseout", function() {

                    $(this).children('i').removeClass( "fa-chain-broken" ).addClass( "fa-link" );
                });

                linkRowBtn.on("click", function(event) {

                    var link = $(this),
                        lId = link.data('link-id');

                    removeLink(lId);

                    dispatch.publish("view_select_remove_link", {
                        lId: lId
                    });

                    event.preventDefault();
                });
            }

            function removeLink(lId){

                var linkElement = getLinkRow(lId);
                if(linkElement.length > 0){
                    linkElement.remove();
                }
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

                linkTable = undefined;
                linkTableBody = undefined;

                parent.updateView(data);
                updateView(data);
            };

            this.highlightLink = highlightLink;

            this.addLink = addLink;
            this.removeLink = removeLink;
        };

        return function(config){

            var parent = new TemplateView(config);
            SelectView.prototype = parent;
            SelectView.prototype.constructor = SelectView;
            return new SelectView(config, parent);
        };
    }
);