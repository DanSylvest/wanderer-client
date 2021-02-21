/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/15/21.
 */

import ServerStatus from "./providers/serverStatus.js";
 
class Cache {
    constructor() {

    }

    init () {
        this.serverStatus = new ServerStatus();
    }
}

export default new Cache();