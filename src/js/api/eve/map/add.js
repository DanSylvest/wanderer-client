/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

/**
 *
 * @param {} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {Boolean} _options.isPrivate
 * @returns {*}
 */
export default function (_options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve({mapId: _e.mapId, userId: _e.userId}) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "add"], {
        name: _options.name,
        description: _options.description,
        isPrivate: _options.isPrivate,
        groups: _options.groups,
    });

    return p.native;
}