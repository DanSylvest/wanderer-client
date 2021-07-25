import NamespacedStore from "./namespacedStore.js";

const SingleValueStore = NamespacedStore.extend({
    state: () => ({
        value: null
    }),
    mutations: {
        update(state, data) {
            state.value = data;
        },
    },
    actions: {
        update(context, data) {
            context.commit("update", data);
        }
    }
})

export default SingleValueStore;