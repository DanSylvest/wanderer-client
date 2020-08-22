/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/11/20.
 */

(function () {
    var moduleName = "env/round";

    var deps = [

    ];

    define(moduleName, deps, function () {
        var round = function (_value) {
            var d = (_value % 1);
            if(d >= 0.5)
                return 1 - d + _value;
            else
                return _value - d;
        };

        return round;
    })
})();