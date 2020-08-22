/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/page/isProtect";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var isProtect = function (_pageName) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.protected) : p.reject();
            }.bind(this));

            this.send(id, ["api", "page", "isProtect"], {pageName: _pageName});

            return p.native;
        };

        return isProtect;
    })
})();