define(
    [
        "common"
    ],
    function (common) {

        return {

            updateText: function(values, parent){

                var i, hasParent = parent !== undefined;

                for(i in values){

                    if(hasParent){
                        parent.find('#' + i).text(values[i]);
                    }
                    else {
                        $('#' + i).text(values[i]);
                    }
                }
            }
        };
    }
);