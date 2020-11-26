/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

import add from "./map/add";
import addFast from "./map/addFast";
import edit from "./map/edit";
import list from "./map/list";
import remove from "./map/remove";
import allowedMaps from "./map/allowedMaps";
import info from "./map/info";
import subscribeMapSystems from "./map/subscribeMapSystems";
import subscribeMapLinks from "./map/subscribeMapLinks";
import subscribeMapExistence from "./map/subscribeMapExistence";
import subscribeAllowedMaps from "./map/subscribeAllowedMaps";
import systemInfo from "./map/systemInfo";
import linkInfo from "./map/linkInfo";
import linkRemove from "./map/linkRemove";
import systemRemove from "./map/systemRemove";
import systemsRemove from "./map/systemsRemove";
import updateSystemsPosition from "./map/updateSystemsPosition";
import updateSystem from "./map/updateSystem";
import updateLink from "./map/updateLink";
import waypoint from "./map/waypoint";
import userWatchMapStatus from "./map/userWatchMapStatus";

export default {
    add: add,
    addFast: addFast,
    edit: edit,
    list: list,
    remove: remove,
    allowedMaps: allowedMaps,
    info: info,
    subscribeMapSystems: subscribeMapSystems,
    subscribeMapLinks: subscribeMapLinks,
    subscribeMapExistence: subscribeMapExistence,
    subscribeAllowedMaps: subscribeAllowedMaps,
    systemInfo: systemInfo,
    linkInfo: linkInfo,
    linkRemove: linkRemove,
    systemRemove: systemRemove,
    systemsRemove: systemsRemove,
    updateSystemsPosition: updateSystemsPosition,
    updateSystem: updateSystem,
    updateLink: updateLink,
    waypoint: waypoint,
    userWatchMapStatus: userWatchMapStatus,
}