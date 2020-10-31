/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../env/promise";

export default function (_type, _options) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.message);
    }.bind(this));

    if(_type === 0) {
        this.send(id, ["api", "user", "register"], {
            type: _type,
            mail: _options.mail,
            password: _options.password,
        });
    } else if(_type === 1) {
        this.send(id, ["api", "user", "register"], {
            type: _type,
            code: _options.code
        });
    }

    return p.native;
}