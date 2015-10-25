define(["d3", "common"],

    function (d3, common) {

        var dataPath = "/hci_prototype/data/";

        return {

            loadNodeLinkData: function (path, onLoad) {

                d3.json(dataPath + path, onLoad);
            }

        };
    }
);