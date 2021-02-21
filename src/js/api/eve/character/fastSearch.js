/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */
import exists from "../../../env/tools/exists";
import CustomPromise from "../../../env/promise";

/**
 *
 * @param {Object} _options
 * @param {String} _options.name
 * @param {String} _options.description
 * @param {Array<String>} _options.groups
 * @returns {*}
 */
export default function (_options) {
    if(!exists(_options.type)) throw "type is undefined";
    if(!exists(_options.match)) throw "match is undefined";

    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "character", "fastSearch"], {
        match: _options.match,
        type: _options.type
    });

    return p.native;
}