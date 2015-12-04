define(["common"],
    function (common) {

        var topics = [];

        function getTopic(id){

            var callbacks,
                topic = topics[id];

            if(topic === undefined){

                callbacks = $.Callbacks();
                topic = {

                    publish: callbacks.fire,
                    subscribe: callbacks.add,
                    unsubscribe: callbacks.remove
                };

                topics[id] = topic;
            }

            return topic;
        }

        return {

            publish: function(id, payload){

                if(common.isEmpty(id)){
                    return;
                }

                getTopic(id).publish(payload);
            },

            subscribe: function(id, fn){

                if(common.isEmpty(id)){
                    return;
                }

                getTopic(id).subscribe(function(payload){
                    fn({
                        topic: id,
                        payload: payload
                    });
                });
            },

            unsubscribe: function(id, fn){

                if(common.isEmpty(id)){
                    return;
                }

                getTopic(id).unsubscribe(fn);
            }
        };
    }
);