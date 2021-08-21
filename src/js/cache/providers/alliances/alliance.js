import MultipleProvider from "../base/multipleProvider";
import PublicInfo from "./publicInfo";
import NamespacedStore from "../../../store/base/namespacedStore";

/**
 * @property {PublicInfo} publicInfo
 */
export default class Alliance extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["alliances", this._id];
        this._vuexTemplate = NamespacedStore.create();

        this.addProvider("publicInfo", () => new PublicInfo(this._id));
    }
}