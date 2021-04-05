/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/15/21.
 */

const ServerStatusStore = {
    namespaced: true,
    state: () => ({
        online: false
    }),
    mutations: {
        setOnline(state) {
            state.online = true;
        },
        setOffline(state) {
            state.online = false;
        }
    },
    actions: {
        setOnline(context) {
            context.commit("setOnline")
        },
        setOffline(context) {
            context.commit("setOffline")
        }
    }
}

export default ServerStatusStore;