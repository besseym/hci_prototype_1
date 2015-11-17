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
        },

        attr: function(args, attributes){

            var p, arg, rtn;

            if(args.length > 0){

                arg = args[0];

                if(args.length > 1 && (typeof arg === 'string' || arg instanceof String)){

                    if(attributes.hasOwnProperty(arg)){
                        attributes[arg] = args[1];
                    }
                }
                else if(args.length === 1){

                    if(arg instanceof Object){

                        for(p in arg){

                            if(arg.hasOwnProperty(p) && attributes.hasOwnProperty(p) && !p.startsWith('_')){
                                attributes[p] = arg[p];
                            }
                        }
                    }
                    else if(typeof arg === 'string' || arg instanceof String) {
                        rtn = attributes[arg];
                    }
                }
            }

            return rtn;
        }

    };
});