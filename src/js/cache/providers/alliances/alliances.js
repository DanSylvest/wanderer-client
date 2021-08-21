import MultipleProvider from "../base/multipleProvider.js";
import AllianceListProvider from "./allianceListProvider";
import NamespacedStore from "../../../store/base/namespacedStore";

/**
 * @property {AllianceListProvider} list
 */
class Alliances extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["alliances"];
        this._vuexTemplate = NamespacedStore.create();

        this.addProvider("list", () => new AllianceListProvider());
    }
}

export default Alliances;