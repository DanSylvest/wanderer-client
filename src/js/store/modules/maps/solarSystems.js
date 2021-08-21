import NamespacedStore from "../../base/namespacedStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";
import SingleValueStore from "../../base/singleValueStore.js";

// export let OnlineCharactersStore = MultipleValuesStore.extend({
//     state: () => ([]),
// }).create();
//
// export let UserCharactersStore = MultipleValuesStore.extend({
//     state: () => ([]),
// }).create();

let SolarSystemsStore = NamespacedStore.create();
let SolarSystemStore = MultipleValuesStore.extend({
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
}).create();

let SolarSystemsExistenceStore = SingleValueStore.create();

export {
    SolarSystemsStore,
    SolarSystemStore,
    SolarSystemsExistenceStore
}