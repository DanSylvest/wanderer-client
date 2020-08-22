/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/axis";
    
    var deps = [
        "env/tools/class"
    ];
    
    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");

        var Axis = classCreator("Axis", null, {
            constructor: function (_min, _range) {
                this.min = _min;
                this.range = _range;

                Object.defineProperty(this, "max", {
                    get: function() { return this.min + this.range; }.bind(this),
                    set: function(val) { this.range = val - this.min; }.bind(this),
                })
            },
            copy: function () {
                return new Axis(this.min, this.range)
            }
        });

        return Axis;
    })    
})();