/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/15/21.
 */

import ServerStatus from "./providers/serverStatus.js";
import SolarSystems from "./providers/solarSystems.js";
import Maps from "./providers/maps/maps.js";
 
class Cache {
    constructor() {

    }

    init () {
        this.serverStatus = new ServerStatus();
        this.solarSystems = new SolarSystems();
        this.maps = new Maps();
    }
}

export default new Cache();