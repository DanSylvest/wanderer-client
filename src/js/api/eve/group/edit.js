/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

/**
 *
 * @param {string} _groupId
 * @param {Object} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {Array<number>} _options.characters
 * @param {Array<number>} _options.corporations
 * @param {Array<number>} _options.alliances
 * @param {Array<number>} _options.moderators
 * @returns {*}
 */
export default function (_groupId, _options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "edit"], {
        groupId: _groupId,
        name: _options.name,
        description: _options.description,
        characters: _options.characters,
        corporations: _options.corporations,
        alliances: _options.alliances,
        moderators: _options.moderators,
    });

    return p.native;
}