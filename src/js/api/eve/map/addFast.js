/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

/**
 *
 * @param {Object} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {Boolean} _options.shareForCorporation
 * @param {Boolean} _options.shareForAlliance
 * @param {Number} _options.characterId
 * @returns {*}
 */
export default function (_options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "addFast"], {
        name: _options.name,
        description: _options.description,
        shareForCorporation: _options.shareForCorporation,
        shareForAlliance: _options.shareForAlliance,
        characterId: _options.characterId,
    });

    return p.native;
}