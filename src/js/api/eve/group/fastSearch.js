/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */
import CustomPromise from "../../../env/promise";

export default function (_options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "fastSearch"], {
        match: _options.match,
        type: _options.type
    });

    return p.native;
}