/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 3/21/21.
 */
import MultipleProvider from "../base/multipleProvider.js";
import MapStore from "../../../store/modules/maps/mapStore.js";
import MapsListProvider from "./mapListProvider";

/**
 * @property {MapsListProvider} list
 */
class Maps extends MultipleProvider {
    constructor() {
        super();

        this._vuexModulePath = ["maps"];
        this._vuexTemplate = MapStore;

        this.addProvider("list", () => new MapsListProvider());
    }
}

export default Maps;