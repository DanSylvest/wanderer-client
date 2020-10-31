/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */
import CustomPromise from "../../../env/promise";

/**
 *
 * @param {} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {String} _options.characters
 * @param {String} _options.corporations
 * @param {String} _options.alliances
 * @returns {*}
 */
export default function (_options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve({groupId: _e.groupId, userId: _e.userId}) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "add"], {
        name: _options.name,
        description: _options.description,
        characters: _options.characters || [],
        corporations: _options.corporations || [],
        alliances: _options.alliances || []
    });

    return p.native;
}