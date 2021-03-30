/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

import link from "./link/_dir";
import routes from "./routes/_dir";
import solarSystem from "./solarSystem/_dir";

import add from "./add";
import addChain from "./addChain";
import addFast from "./addFast";
import edit from "./edit";
import list from "./list";
import remove from "./remove";
import info from "./info";
import subscribeMapExistence from "./subscribeMapExistence";
import subscribeAllowedMaps from "./subscribeAllowedMaps";
import subscribeAllowedCharacters from "./subscribeAllowedCharacters";
import waypoint from "./waypoint";
import updateWatchStatus from "./updateWatchStatus";

export default {
    link: link,
    routes: routes,
    solarSystem: solarSystem,

    add: add,
    addChain: addChain,
    addFast: addFast,
    edit: edit,
    list: list,
    remove: remove,
    info: info,
    subscribeMapExistence: subscribeMapExistence,
    subscribeAllowedMaps: subscribeAllowedMaps,
    subscribeAllowedCharacters: subscribeAllowedCharacters,
    waypoint: waypoint,
    updateWatchStatus: updateWatchStatus,
}