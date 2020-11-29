/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */
import add from "./add";
import list from "./list";
import info from "./info";
import remove from "./remove";
import edit from "./edit";
import allowedGroups from "./allowedGroups";
import getAllowedCharacters from "./getAllowedCharacters";
import updateAllowedCharacters from "./updateAllowedCharacters";

export default {
    add: add,
    list: list,
    info: info,
    remove: remove,
    edit: edit,
    allowedGroups: allowedGroups,
    getAllowedCharacters: getAllowedCharacters,
    updateAllowedCharacters: updateAllowedCharacters
}