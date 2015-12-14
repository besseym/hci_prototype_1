define(function () {

    function isUndefined(v) {
        return (typeof(v) === "undefined");
    }

    function isString(v){
        return (typeof v === 'string' || v instanceof String);
    }

    function isEmpty(v){
        return (isUndefined(v) || v === null);
    }

    return {

        log: function (m) {
            console.log(m);
        },

        isUndefined: isUndefined,

        isString: isString,

        isEmpty: isEmpty,

        isBlankStr: function(v){
            return isEmpty(v) || v === "";
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

        setAttributes: function(args, attributes){

            var p, arg, rtn;

            if(args.length > 0){

                arg = args[0];

                if(arg instanceof Object){

                    for(p in arg){

                        if(arg.hasOwnProperty(p) && attributes.hasOwnProperty(p) && !p.startsWith('_')){
                            attributes[p] = arg[p];
                        }
                    }
                }
                else if(isString(arg) && args.length === 2) {
                    attributes[arg] = args[1];
                }
            }

            return rtn;
        },

        getAttributes: function(args, attributes){

            var i, p, rtn;

            if(args.length > 0){

                if(args.length === 1){

                    p = args[0];
                    rtn = attributes[p];
                }
                else {

                    for(i = 0; i < args.length; i++){

                        p = args[i];

                        if(attributes.hasOwnProperty(p) && !p.startsWith('_')){

                            if(rtn === undefined){
                                rtn = {};
                            }

                            rtn[p] = attributes[p];
                        }
                    }
                }
            }

            return rtn;
        },

        mergeObjs: function(obj1, obj2) {

            var p,
                obj3 = {};

            for (p in obj1) { obj3[p] = obj1[p]; }
            for (p in obj2) { obj3[p] = obj2[p]; }

            return obj3;
        }

    };
});