import MultipleProvider from "../base/multipleProvider.js";
import CorporationListProvider from "./corporationListProvider";
import NamespacedStore from "../../../store/base/namespacedStore";

/**
 * @property {CorporationListProvider} list
 */
class Corporations extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["corporations"];
        this._vuexTemplate = NamespacedStore.create();

        this.addProvider("list", () => new CorporationListProvider());
    }
}

export default Corporations;