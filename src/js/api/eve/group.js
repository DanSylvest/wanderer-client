/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */
import add from "./group/add";
import list from "./group/list";
import info from "./group/info";
import fastSearch from "./group/fastSearch";
import remove from "./group/remove";
import edit from "./group/edit";
import allowedGroups from "./group/allowedGroups";
import getAllowedCharactersForGroup from "./group/getAllowedCharactersForGroup";
import updateAllowedCharactersForGroup from "./group/updateAllowedCharactersForGroup";

export default {
    add: add,
    list: list,
    info: info,
    fastSearch: fastSearch,
    remove: remove,
    edit: edit,
    allowedGroups: allowedGroups,
    getAllowedCharactersForGroup: getAllowedCharactersForGroup,
    updateAllowedCharactersForGroup: updateAllowedCharactersForGroup
}