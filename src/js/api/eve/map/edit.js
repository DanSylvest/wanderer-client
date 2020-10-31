/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

/**
 *
 * @param {string} _mapId
 * @param {Object} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {Boolean} _options.isPrivate
 * @param {Array<String>} _options.groups
 * @returns {*}
 */
export default function (_mapId, _options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "edit"], {
        mapId: _mapId,
        name: _options.name,
        description: _options.description,
        isPrivate: _options.isPrivate,
        groups: _options.groups,
    });

    return p.native;
}