import SingleValueStore from "./singleValueStore.js";

const MultipleValuesStore  = SingleValueStore.extend({
    state: () => ({}),
    mutations: {
        update(state, data) {
            for (let key in data)
                // eslint-disable-next-line no-prototype-builtins
                if (data.hasOwnProperty(key))
                    state[key] = data[key];
        },
    }
})

export default MultipleValuesStore;
