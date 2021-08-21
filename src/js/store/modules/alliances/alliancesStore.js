import MultipleValuesStore from "../../base/multipleValuesStore.js";

export let PublicInfoStore = MultipleValuesStore.extend({
    state: () => ({
        creatorCorporationId: null,
        creatorId: null,
        dateFounded: null,
        executorCorporationId: null,
        name: "",
        ticker: "",
    }),
}).create();