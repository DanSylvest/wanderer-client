/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/19/20.
 */
import CustomPromise from "../../../env/promise";
import exists from "../../../env/tools/exists";

export default function (_options) {
    if(!exists(_options.match)) throw "match is undefined";

    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "alliance", "fastSearch"], {
        match: _options.match
    });

    return p.native;
}