import NamespacedStore from "../../base/namespacedStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";

let SolarSystemsStore = NamespacedStore.create();
let SolarSystemStore = MultipleValuesStore.extend({
    state: () => ({
        systemClass: null,
        security: null,
        solarSystemId: null,
        constellationId: null,
        regionId: null,
        solarSystemName: null,
        constellationName: null,
        regionName: null,
        systemType: null,
        typeDescription: null,
        typeName: null,
        isShattered: null,
        effectType: null,
        effectName: null,
        effectData: null,
        statics: null,
        solarSystemNameLC: null,
        triglavianInvasionStatus: null
    }),
}).create();

export {
    SolarSystemsStore,
    SolarSystemStore,
}
export default SolarSystemStore;