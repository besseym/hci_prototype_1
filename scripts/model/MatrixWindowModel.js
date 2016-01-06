define(["common"],
    function (common) {

        var MatrixWindowModel = function (config) {

            var attributes = {

                xMax: undefined,
                xStart: 0,
                xEnd: undefined,

                yMax: undefined,
                yStart: 0,
                yEnd: undefined,

                get xRange() {
                    return this.xEnd - this.xStart;
                },

                get yRange() {
                    return this.yEnd - this.yStart;
                }
            };

            set(config);

            function getMoveRateX(){

                var moveRate = Math.floor(Math.pow(attributes.xRange, 0.8));
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getMoveRateY(){

                var moveRate = Math.floor(Math.pow(attributes.yRange, 0.8));
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getZoomRateX () {

                var moveRate = Math.floor(attributes.xRange * 0.25);
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function getZoomRateY () {

                var moveRate = Math.floor(attributes.yRange * 0.25);
                if(moveRate <= 0){
                    moveRate = 1;
                }

                return moveRate;
            }

            function move(direction){

                var moveRate,
                    xMoveRate = getMoveRateX(),
                    yMoveRate = getMoveRateY();

                switch (direction) {

                    case "left":

                        if((attributes.xStart - xMoveRate) >= 0){
                            attributes.xStart = attributes.xStart - xMoveRate;
                            attributes.xEnd = attributes.xEnd - xMoveRate;
                        }
                        else {
                            attributes.xEnd = attributes.xEnd - attributes.xStart;
                            attributes.xStart = 0;
                        }

                        break;

                    case "up":

                        if((attributes.yStart - yMoveRate) >= 0){
                            attributes.yStart = attributes.yStart - yMoveRate;
                            attributes.yEnd = attributes.yEnd - yMoveRate;
                        }
                        else {
                            attributes.yEnd = attributes.yEnd - attributes.yStart;
                            attributes.yStart = 0;
                        }

                        break;

                    case "right":

                        if((attributes.xEnd + xMoveRate) <= attributes.xMax){
                            attributes.xStart = attributes.xStart + xMoveRate;
                            attributes.xEnd = attributes.xEnd + xMoveRate;
                        }
                        else {

                            moveRate = attributes.xMax - attributes.xEnd;
                            attributes.xStart = attributes.xStart + moveRate;
                            attributes.xEnd = attributes.xMax;
                        }

                        break;

                    case "down":

                        if((attributes.yEnd + yMoveRate) <= attributes.yMax){
                            attributes.yStart = attributes.yStart + yMoveRate;
                            attributes.yEnd = attributes.yEnd + yMoveRate;
                        }
                        else {

                            moveRate = attributes.yMax - attributes.yEnd;
                            attributes.yStart = attributes.yStart + moveRate;
                            attributes.yEnd = attributes.yMax;
                        }

                        break;
                }
            }

            function zoom(){

                var xMoveRate = getZoomRateX(),
                    yMoveRate = getZoomRateY();

                if((attributes.yStart + yMoveRate) < (attributes.yEnd - yMoveRate)){

                    attributes.yStart = attributes.yStart + yMoveRate;
                    attributes.yEnd = attributes.yEnd - yMoveRate;
                }

                if((attributes.xStart + xMoveRate) < (attributes.xEnd - xMoveRate)){

                    attributes.xStart = attributes.xStart + xMoveRate;
                    attributes.xEnd = attributes.xEnd - xMoveRate;
                }
            }

            function expand(){

                var xMoveRate = getZoomRateX(),
                    yMoveRate = getZoomRateY();

                //source start
                if((attributes.yStart - yMoveRate) >= 0){
                    attributes.yStart = attributes.yStart - yMoveRate;
                }
                else {
                    attributes.yStart = 0;
                }

                //source end
                if((attributes.yEnd + yMoveRate) <= attributes.yMax){
                    attributes.yEnd = attributes.yEnd + yMoveRate;
                }
                else {
                    attributes.yEnd = attributes.yMax;
                }

                //target start
                if((attributes.xStart - xMoveRate) >= 0){
                    attributes.xStart = attributes.xStart - xMoveRate;
                }
                else {
                    attributes.xStart = 0;
                }

                //target end
                if((attributes.xEnd + xMoveRate) <= attributes.xMax){
                    attributes.xEnd = attributes.xEnd + xMoveRate;
                }
                else {
                    attributes.xEnd = attributes.xMax;
                }
            }

            function set(){
                common.setAttributes(arguments, attributes);
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.move = move;
            this.zoom = zoom;
            this.expand = expand;

            this.getViewModel = function(){

                return {

                    xMin: 0,
                    xMax: attributes.xMax,
                    xStart: attributes.xStart,
                    xEnd: attributes.xEnd,

                    yMin: 0,
                    yMax: attributes.yMax,
                    yStart: attributes.yStart,
                    yEnd: attributes.yEnd
                };
            };
        };

        return function(config){
            return new MatrixWindowModel(config);
        };
    }
);