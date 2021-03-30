/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/15/21.
 */

const SolarSystemStore = {
    namespaced: true,
    state: () => ({
        isLocked: null,
        name: null,
        description: null,
        tag: null,
        status: null,
        signatures: null,
        position: null,
        onlineCount: null,
        onlineCharacters: null,
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
                    throw `Exception: "Attribute ${attr} in not found in available attributes for MapSolarSystemStore`
            }

            context.commit("update", data);
        }
    }
}

let availableAttrs = [
    "isLocked",
    "name",
    "description",
    "tag",
    "status",
    "signatures",
    "position",
    "onlineCount",
    "onlineCharacters",
]

export default SolarSystemStore;