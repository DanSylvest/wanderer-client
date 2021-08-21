/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/15/21.
 */

import ServerStatus from "./providers/serverStatus.js";
import SolarSystems from "./providers/universe/solarSystems.js";
import Maps from "./providers/maps/maps.js";
import Characters from "./providers/characters/characters.js";
import Ships from "./providers/universe/ships.js";
import TQStatus from "./providers/server/status.js";
import Corporations from "./providers/corporations/corporations";
import Alliances from "./providers/alliances/alliances";

class Cache {
    constructor() {

    }

    init () {
        this.serverStatus = new ServerStatus();
        this.solarSystems = new SolarSystems();
        this.maps = new Maps();
        this.characters = new Characters();
        this.corporations = new Corporations();
        this.alliances = new Alliances();
        this.ships = new Ships();
        this.tqStatus = new TQStatus();
    }
}

export default new Cache();