let emptyModule = {
    namespaced: false,
    state: () => ({}),
    mutations: {},
    actions: {}
}

const extendVueModule = function (vueModule, {namespaced, state, mutations, actions}) {
    let _namespaced = vueModule.namespaced;
    let _state = vueModule.state;
    let _mutations = vueModule.mutations;
    let _actions = vueModule.actions;

    if (namespaced) _namespaced = namespaced;
    if (state) _state = state;
    if (mutations) _mutations = {..._mutations, ...mutations};
    if (actions) _actions = {..._actions, ...actions};

    return {
        create: () => ({
            namespaced: _namespaced,
            state: _state,
            mutations: _mutations,
            actions: _actions,
        }),
        extend: (module) => extendVueModule({
            namespaced: _namespaced,
            state: _state,
            mutations: _mutations,
            actions: _actions,
        }, module)
    }
};

const AbstractStore = extendVueModule(emptyModule, {});

export default AbstractStore;