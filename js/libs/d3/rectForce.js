(function () {
    var moduleName = "libs/d3/rectForce";

    var deps = [
        "env/vector2",
    ];

    define(moduleName, deps, function () {
        var Vector2 = require("env/vector2");

        var rectForce = function (links, _w, _h) {
            var nodes,
                w = _w,
                h = _h;


            function force(alpha) {
                for (var i = 0; i < links.length; ++i) {
                    var link = links[i];
                    var source = link.source;
                    var target = link.target;
                    var dist = new Vector2(source.x, source.y)["-"](new Vector2(target.x, target.y));
                    var normalized = dist.copy().normalize();

                    var str = 1;
                    if(Math.abs(dist.x) < w) {
                        source.vx += normalized.x * str;
                        target.vx -= normalized.x * str;
                    }

                    if(Math.abs(dist.y) < h) {
                        source.vy += normalized.y * str;
                        target.vy -= normalized.y * str;
                    }


                }
            }

            function initialize() {

            }

            force.initialize = function (_) {
                nodes = _;
                initialize();
            };

            return force;
        }

        return rectForce;

    });
})();