/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
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
        _e.success ? p.resolve(_e.data) : p.reject(_e.error);
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