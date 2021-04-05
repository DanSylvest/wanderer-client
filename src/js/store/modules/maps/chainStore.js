const ChainStore = {
    namespaced: true,
    state: () => ({
        solarSystemSource: null,
        solarSystemTarget: null,
        massStatus: null,
        timeStatus: null,
        shipSizeType: null,
        wormholeType: null,
        countOfPassage: null,
        created: null,
        updated: null,
    }),
    mutations: {
        update(state, data) {
            for(let attr in data) {
                state[attr] = data[attr];
            }
        },
    },
    actions: {
        update (context, data) {
            for(let attr in data) {
                if(availableAttrs.indexOf(attr) === -1)
                    throw `Exception: "Attribute ${attr} in not found in available attributes for MapChainsStore`
            }

            context.commit("update", data);
        }
    }
}

let availableAttrs = [
    "solarSystemSource",
    "solarSystemTarget",
    "massStatus",
    "timeStatus",
    "shipSizeType",
    "wormholeType",
    "countOfPassage",
    "created",
    "updated",
]

export default ChainStore;