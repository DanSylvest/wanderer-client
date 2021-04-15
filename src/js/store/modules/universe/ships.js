import NamespacedStore from "../../base/namespacedStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";

let ShipStore = NamespacedStore.create();
let ShipsStore = NamespacedStore.create();
let InfoStore = MultipleValuesStore.extend({
    state: () => ({
        typeName: null,
        volume: null,
        description: null,
        mass: null,
        capacity: null,
        groupName: null,
    }),
}).create();

export {
    ShipStore,
    ShipsStore,
    InfoStore,
}