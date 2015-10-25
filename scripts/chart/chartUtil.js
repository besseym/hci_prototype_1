define(["d3", "common"],

    function (d3, common) {

        var dataPath = "/hci_prototype/data/",

            colorDefault = "#f5f5f5",
            typeColorScale = d3.scale.category20(),
            ratingColorScale = d3.scale.category20(),
            otherColorScale = d3.scale.category10();


        function buildTypeColorArray(hArray, colorScale){

            var k, h,
                typeColorArray = [];

            for(k in hArray){

                h = hArray[k];
                c = colorScale(h.id);

                typeColorArray.push({
                    id: h.id,
                    name: h.name,
                    color: c
                });
            }

            return typeColorArray;
        }

        return {

            loadNodeLinkData: function (path, onLoad) {

                d3.json(dataPath + path, onLoad);
            },

            getTypeColorArray: function(type, data){

                var typeColorArray;

                switch(type){

                    case 'type':
                        typeColorArray = buildTypeColorArray(data.get('typeAttrMap'), typeColorScale);
                        break;
                    case 'status':
                        typeColorArray = buildTypeColorArray(data.get('statusAttrMap'), otherColorScale);
                        break;
                    case 'rating':
                        typeColorArray = buildTypeColorArray(data.get('ratingAttrMap'), ratingColorScale);
                        break;
                    case 'match':
                        typeColorArray = buildTypeColorArray(data.get('matchAttrMap'), otherColorScale);
                        break;
                    case 'restriction':
                        typeColorArray = buildTypeColorArray(data.get('ageGateAttrMap'), otherColorScale);
                        break;
                    case 'title-type':
                        typeColorArray = buildTypeColorArray(data.get('titleTypeAttrMap'), otherColorScale);
                        break;
                }

                return typeColorArray;
            }
        };
    }
);