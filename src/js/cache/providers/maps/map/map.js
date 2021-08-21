import MultipleProvider from "../../base/multipleProvider";
import MapStore from "../../../../store/modules/maps/mapStore";
import SolarSystems from "./solarSystems/solarSystems";
import Chains from "./chains/chains";
import Hubs from "./hubs";
import OnlineCharacters from "./onlineCharacters";
import UserCharacters from "./userCharacters";

/**
 * @property {SolarSystems} solarSystems
 * @property {Chains} chains
 * @property {Hubs} hubs
 * @property {OnlineCharacters} onlineCharacters
 * @property {UserCharacters} userCharacters
 */
export default class Map extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["maps", this._id];
        this._vuexTemplate = MapStore;

        this.addProvider("solarSystems", () => new SolarSystems(this._id));
        this.addProvider("chains", () => new Chains(this._id));
        this.addProvider("hubs", () => new Hubs(this._id));
        this.addProvider("onlineCharacters", () => new OnlineCharacters(this._id));
        this.addProvider("userCharacters", () => new UserCharacters(this._id));
    }
}