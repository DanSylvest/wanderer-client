import NamespacedStore from "../../base/namespacedStore.js";
import SingleValueStore from "../../base/singleValueStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";

export let CharacterStore = NamespacedStore.create();
export let CharactersStore = NamespacedStore.create();
export let OnlineStore = SingleValueStore.create();
export let ShipStore = SingleValueStore.create();
export let LocationStore = SingleValueStore.create();

export let InfoStore = MultipleValuesStore.extend({
    state: () => ({
        // name: "",
        addDate: null,
        // corporation: null,
        // corporationId: null,
        // alliance: null,
        // allianceId: null,
        // corporationTicker: null,
        // allianceTicker: null,
    }),
}).create();

export let PublicInfoStore = MultipleValuesStore.extend({
    state: () => ({
        allianceId: undefined,
        corporationId: undefined,
        ancestryId: null,
        raceId: null,
        bloodlineId: null,
        birthday: null,
        description: null,
        gender: null,
        name: "",
    }),
}).create();