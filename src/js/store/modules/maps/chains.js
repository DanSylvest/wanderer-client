/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 4/15/21.
 */

import NamespacedStore from "../../base/namespacedStore.js";
import MultipleValuesStore from "../../base/multipleValuesStore.js";
import SingleValueStore from "../../base/singleValueStore.js";

let ChainsStore = NamespacedStore.create();
let ChainStore = MultipleValuesStore.extend({
    state: () => ({
        solarSystemSource: null,
        solarSystemTarget: null,
        massStatus: null,
        timeStatus: null,
        shipSizeType: null,
        wormholeType: null,
        countOfPassage: null,
        created: null,
        updated: null,
    }),
}).create();

let ChainsExistenceStore = SingleValueStore.create();

export {
    ChainsStore,
    ChainStore,
    ChainsExistenceStore
}