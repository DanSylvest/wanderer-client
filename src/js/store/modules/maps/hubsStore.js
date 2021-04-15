/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/15/21.
 */

const HubsStore = {
    namespaced: true,
    state: () => ({
        list: []
    }),
    mutations: {
        update(state, data) {
            state.list = data;
        },
    },
    actions: {
        update (context, data) {
            context.commit("update", data);
        }
    }
}

export default HubsStore;