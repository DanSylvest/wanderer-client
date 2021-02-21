/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

/**
 *
 * @param {Object} _options
 * @param {String} _options.mapId
 * @param {Boolean} _options.status
 * @returns {*}
 */
export default function (_options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "updateWatchStatus"], {
        mapId: _options.mapId,
        status: _options.status
    });

    return p.native;
}