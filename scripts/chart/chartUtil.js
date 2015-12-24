define(
    [
        "d3",
        "common"
    ],

    function (d3, common) {

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

        return {

            getQualitativeColorScale: getQualitativeColorScale,

            decorateWithColor: function(data){

                var i, k, size, color, colorScale, property, domain = [];

                if(data !== undefined && "properties" in data){
                    
                    size = data.properties.length;
                    for(i = 0; i < size; i++){
                        property = data.properties[i];
                        domain.push(property.name);
                    }

                    colorScale = getQualitativeColorScale(domain);

                    for(i = 0; i < size; i++){
                        property = data.properties[i];
                        property.color = colorScale(property.name);
                        data.properties[i] = property;
                    }
                }
            }

        };
    }
);
