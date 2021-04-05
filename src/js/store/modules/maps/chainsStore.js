const ChainsStore = {
    namespaced: true,
    state: () => ({
        chains: []
    }),
    mutations: {
        update(state, data) {
            state.chains = data;
        },
    },
    actions: {
        update (context, data) {
            context.commit("update", data);
        }
    }
}

export default ChainsStore;