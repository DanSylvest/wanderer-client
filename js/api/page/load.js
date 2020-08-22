/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/page/load";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        var loadPage = function (_pageName) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve(_e.page) : p.reject();
            }.bind(this));

            this.send(id, ["api", "page", "load"], {pageName: _pageName});

            return p.native;
        };


        return loadPage;
    })
})();