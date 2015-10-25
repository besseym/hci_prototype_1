define(function () {

    function isUndefined(v) {
        return (typeof(v) === "undefined");
    }

    return {

        log: function (m) {
            console.log(m);
        },

        hasValue: function (v) {
            return !isUndefined(v) && v !== null;
        },

        isUndefined: function (v) {
            return isUndefined(v);
        },

        getParameterMap: function(){

            var i,
                parametersArray,
                parameterArray,
                parameterMap = [],
                queryString = window.location.search;

            if(!isUndefined(queryString) && queryString.startsWith('?')) {

                parametersArray = queryString.substring(1).split('?');
                for (i = 0; i < parametersArray.length; i++) {

                    parameterArray = parametersArray[i].split('=');
                    if(parameterArray.length > 1){
                        parameterMap[parameterArray[0]] = decodeURIComponent(parameterArray[1]);
                    }
                }
            }

            return parameterMap;
        }

    };
});