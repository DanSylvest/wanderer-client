/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/15/21.
 */

import ServerStatus from "./providers/serverStatus.js";
import SolarSystems from "./providers/universe/solarSystems.js";
import Maps from "./providers/maps/maps.js";
import Characters from "./providers/characters/characters.js";
import Ships from "./providers/universe/ships.js";

class Cache {
    constructor() {

    }

    init () {
        this.serverStatus = new ServerStatus();
        this.solarSystems = new SolarSystems();
        this.maps = new Maps();
        this.characters = new Characters();
        this.ships = new Ships();
    }
}

export default new Cache();