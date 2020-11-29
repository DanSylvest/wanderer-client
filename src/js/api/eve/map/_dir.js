/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

import link from "./link/_dir";
import solarSystem from "./solarSystem/_dir";

import add from "./add";
import addFast from "./addFast";
import edit from "./edit";
import list from "./list";
import remove from "./remove";
import info from "./info";
import subscribeMapExistence from "./subscribeMapExistence";
import subscribeAllowedMaps from "./subscribeAllowedMaps";
import waypoint from "./waypoint";
import updateWatchStatus from "./updateWatchStatus";

export default {
    link: link,
    solarSystem: solarSystem,

    add: add,
    addFast: addFast,
    edit: edit,
    list: list,
    remove: remove,
    info: info,
    subscribeMapExistence: subscribeMapExistence,
    subscribeAllowedMaps: subscribeAllowedMaps,
    waypoint: waypoint,
    updateWatchStatus: updateWatchStatus,
}