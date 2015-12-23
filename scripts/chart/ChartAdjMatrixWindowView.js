define(
    [
        "common",
        "dispatch",
        "chart/ChartView"
    ],

    function (common, dispatch, ChartView) {

        var ChartAdjMatrixWindowView = function (config, parent) {

            var context,
                attributes = {

                    xMax: 0,
                    xStart: 0,
                    xEnd: 0,

                    yMax: 0,
                    yStart: 0,
                    yEnd: 0
                },
                xScale, yScale, sep = 0.05;

            set(config);
            setup();

            function setup(){

                var view = parent.getView();

                context = view.getContext("2d");
            }

            function getDomainX(max){

                var i, domain = [];

                for(i = 0; i < attributes.xMax; i++){
                    domain.push(i);
                }

                return domain;
            }

            function getDomainY(max){

                var i, domain = [];

                for(i = attributes.yMax - 1; i >= 0; i--){
                    domain.push(i);
                }

                return domain;
            }

            function updateScale(){

                normalizeAttributes();

                xScale = d3.scale.ordinal().domain(getDomainX()).rangeBands(parent.get('rangeX'), sep);
                yScale = d3.scale.ordinal().domain(getDomainY()).rangeBands(parent.get('rangeY'), sep);
            }

            function normalizeAttributes(){

                if(attributes.xEnd > attributes.xMax){
                    attributes.xEnd = attributes.xMax;
                }

                if(attributes.xStart > attributes.xEnd){
                    attributes.xStart = attributes.xEnd;
                }

                if(attributes.yEnd > attributes.yMax){
                    attributes.yEnd = attributes.yMax;
                }

                if(attributes.yStart > attributes.yEnd){
                    attributes.yStart = attributes.yEnd;
                }
            }

            function draw(){

                var xi, yi,
                    x, y,
                    width = xScale.rangeBand(),
                    height = yScale.rangeBand();



                for(xi = 0; xi < attributes.xMax; xi++){

                    for(yi = 0; yi < attributes.yMax; yi++){

                        if(xi >= attributes.xStart && xi < attributes.xEnd && yi >= attributes.yStart && yi < attributes.yEnd ){

                            context.fillStyle = "#d5d5d5";
                        }
                        else {
                            context.fillStyle = "#f5f5f5";
                        }

                        x = xScale(xi);
                        y = yScale(yi);

                        context.fillRect(x, y, width, height);
                    }
                }
            }

            function set(config){

                var doUpdateScale = false,
                    view = parent.getView();

                common.setAttributes(arguments, attributes);

                if(config.width !== undefined){

                    view.setAttribute("width", config.width);
                }

                if(config.height !== undefined){

                    view.setAttribute("height", config.height);
                }
            }

            /***** public methods *****/

            this.draw = draw;
            this.updateScale = updateScale;

            this.set = function(config){

                parent.set.apply(parent, arguments);
                set.apply(this, arguments);
            };

        };

        return function(config){

            var parent = new ChartView(config);
            ChartAdjMatrixWindowView.prototype = parent;
            ChartAdjMatrixWindowView.prototype.constructor = ChartAdjMatrixWindowView;
            return new ChartAdjMatrixWindowView(config, parent);
        };
    }
);