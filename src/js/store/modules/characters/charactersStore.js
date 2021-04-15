import NamespacedStore from "../../base/namespacedStore.js";
import SingleValueStore from "../../base/singleValueStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";

let CharacterStore = NamespacedStore.create();
let CharactersStore = NamespacedStore.create();
let OnlineStore = SingleValueStore.create();
let ShipStore = SingleValueStore.create();
let LocationStore = SingleValueStore.create();
let InfoStore = MultipleValuesStore.extend({
    state: () => ({
        name: "",
        addDate: null,
        corporation: null,
        corporationId: null,
        alliance: null,
        allianceId: null,
        corporationTicker: null,
        allianceTicker: null,
    }),
}).create();

export {
    CharacterStore,
    CharactersStore,
    OnlineStore,
    ShipStore,
    LocationStore,
    InfoStore
}