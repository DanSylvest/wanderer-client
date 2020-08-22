/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

(function () {
    var moduleName = "api/component/load";

    var deps = [
        "env/promise"
    ];

    define(moduleName, deps, function () {
        var promise = require("env/promise");

        /**
         *
         * @param {String} _componentName
         * @returns {*}
         */
        var loadComponent = function (_componentName) {
            var p = new promise();

            var id = this.add(function (_e) {
                this.remove(id);
                _e.success ? p.resolve({
                    path: _e.path,
                    code: _e.component
                }) : p.reject();
            }.bind(this));

            this.send(id, ["api", "component", "load"], {componentName: _componentName});

            return p.native;
        };

        return loadComponent;
    })
})();