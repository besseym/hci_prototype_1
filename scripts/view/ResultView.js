define(
    [
        "common",
        "view/View"
    ],
    function (common, View) {

        var ResultView = function (config, parent) {

            function updateView(data){

                parent.updateView({"result-size": data.resultSize});
            }

            /***** public methods *****/

            this.updateView = updateView;
        };

        return function(config){

            var parent = new View(config);
            ResultView.prototype = parent;
            ResultView.prototype.constructor = ResultView;
            return new ResultView(config, parent);
        };
    }
);