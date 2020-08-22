/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/19/20.
 */

(function () {
    var moduleName = "api/eve/corporation/fastSearch";

    var deps = [
        "env/promise",
        "env/tools/exist",
    ];

    define(moduleName, deps, function () {
        var CustomPromise = require("env/promise");
        var exist         = require("env/tools/exist");

        var request = function (_options) {
            if(!exist(_options.match)) throw "match is undefined";

            var p = new CustomPromise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.result) : p.reject(_e.message);
            }.bind(this));

            this.send(id, ["api", "eve", "corporation", "fastSearch"], {
                match: _options.match
            });

            return p.native;
        };

        return request;
    })
})();