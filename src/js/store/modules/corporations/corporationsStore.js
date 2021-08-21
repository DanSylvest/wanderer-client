import MultipleValuesStore from "../../base/multipleValuesStore.js";
import NamespacedStore from "../../base/namespacedStore";
export let CorporationStore = NamespacedStore.create();
export let CorporationsStore = NamespacedStore.create();
export let PublicInfoStore = MultipleValuesStore.extend({
    state: () => ({
        allianceId: undefined,
        ceoId: null,
        creatorId: null,
        dateFounded: null,
        description: "",
        home_stationId: null,
        memberCount: null,
        name: "",
        shares: null,
        tax_rate: null,
        ticker: null,
        url: null,
        warEligible: null,
    }),
}).create();