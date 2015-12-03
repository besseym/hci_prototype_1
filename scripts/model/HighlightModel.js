define(["common"],

    function (common) {

        var HighlightModel = function (config) {

            var attributes = {
                    title: null,
                    stats: null
                },
                colorScaleMap = [];

            set(config);

            function set(){

                var i, k, size, color, colorScale, property, domain = [];

                common.setAttributes(arguments, attributes);

                if(attributes.stats !== null){

                    size = attributes.stats.properties.length;
                    for(i = 0; i < size; i++){
                        property = attributes.stats.properties[i];
                        domain.push(property.name);
                    }

                    colorScale = getQualitativeColorScale(domain);

                    for(i = 0; i < size; i++){
                        property = attributes.stats.properties[i];
                        property.color = colorScale(property.name);
                        attributes.stats.properties[i] = property;
                    }
                }
            }

            function getQualitativeColorScale(domain){

                var scale, size = (domain.length < 3) ? 3 : domain.length;

                if(size <= 9){
                    scale = d3.scale.ordinal().domain(domain).range(colorbrewer.Set1[size]);
                }
                else if(size <= 12){
                    scale = d3.scale.ordinal().domain(domain).range(colorbrewer.Paired[size]);
                }
                else if(size <= 20){
                    scale = d3.scale.category20();
                }
                else {
                    throw "Too many qualitative values to scale.";
                }

                return scale;
            }

            /***** public methods *****/
            this.set = set;

            this.get = function(){
                return common.getAttributes(arguments, attributes);
            };

            this.getHighlightViewModel = function(){

                return {
                    title: attributes.title,
                    stats: attributes.stats
                };
            };

            this.getColorKeyViewModel = function(){

                return attributes.stats;
            };
        };

        return function(config){
            return new HighlightModel(config);
        };
    }
);