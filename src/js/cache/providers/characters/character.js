import MultipleProvider from "../base/multipleProvider";
import {CharacterStore} from "../../../store/modules/characters/charactersStore";
import Online from "./online";
import Location from "./location";
import Ship from "./ship";
import Info from "./info";
import PublicInfo from "./publicInfo";

/**
 * @property {Online} online
 * @property {Location} location
 * @property {Ship} ship
 * @property {Info} info
 * @property {PublicInfo} publicInfo
 */
export default class Character extends MultipleProvider {
    constructor(id) {
        super();

        this._id = id;
        this._vuexModulePath = ["characters", this._id];
        this._vuexTemplate = CharacterStore;

        this.addProvider("online", () => new Online(this._id));
        this.addProvider("location", () => new Location(this._id));
        this.addProvider("ship", () => new Ship(this._id));
        this.addProvider("info", () => new Info(this._id));
        this.addProvider("publicInfo", () => new PublicInfo(this._id));
    }
}