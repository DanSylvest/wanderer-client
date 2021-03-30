/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/15/21.
 */

const SolarSystemsStore = {
    namespaced: true,
    state: () => ({
        systems: []
    }),
    mutations: {
        update(state, data) {
            state.systems = data;
        },
    },
    actions: {
        update (context, data) {
            context.commit("update", data);
        }
    }
}

export default SolarSystemsStore;