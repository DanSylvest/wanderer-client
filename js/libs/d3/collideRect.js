(function () {
    var moduleName = "libs/d3/collideRect";

    var deps = [
        "env/vector2",
    ];

    define(moduleName, deps, function () {
        var Vector2 = require("env/vector2");

        var collideRect = function (_w, _h) {
            var nodes,
                w = _w,
                h = _h;


            function force() {
                var offsetTop = (h / 2) + 5;
                var offsetLeft = (w / 2) + 5;
                var passes = 1;
                var passesCount = 0;

                while (passesCount < passes) {
                    passesCount++;

                    for (var a = 0; a < nodes.length; a++) {
                        var markerA = nodes[a];

                        if(markerA.fx && !markerA.lock) continue;

                        var o1 = new Vector2(markerA.x - offsetLeft, markerA.y - offsetTop);
                        var o2 = new Vector2(markerA.x + offsetLeft, markerA.y + offsetTop);

                        for (var b = 0; b < nodes.length; b++) {
                            var markerB = nodes[b];

                            if(markerB.fx&& !markerB.lock) continue;

                            if (a !== b) {
                                var p1 = new Vector2(markerB.x - offsetLeft, markerB.y - offsetTop);
                                var p2 = new Vector2(markerB.x + offsetLeft, markerB.y + offsetTop);

                                var intersect = (p1.x <= o2.x && o1.x <= p2.x && p1.y <= o2.y && o1.y <= p2.y);

                                if (intersect) {
                                    var xa1 = o2.x - p1.x, // shift obj left , p right
                                        xa2 = p2.x - o1.x, // shift obj right, p left
                                        ya1 = o2.y - p1.y, // shift obj up   , p down
                                        ya2 = p2.y - o1.y, // shift obj down , p up
                                        adj = Math.min(xa1, xa2, ya1, ya2);

                                    if (adj === xa1) {
                                        if(!(markerA.lock))
                                            markerA.x -= adj / 2;

                                        if(!(markerB.lock))
                                            markerB.x += adj / 2;
                                    } else if (adj === xa2) {
                                        if(!(markerA.lock))
                                            markerA.x += adj / 2;

                                        if(!(markerB.lock))
                                            markerB.x   -= adj / 2;
                                    } else if (adj === ya1) {
                                        if(!(markerA.lock))
                                            markerA.y -= adj / 2;

                                        if(!(markerB.lock))
                                            markerB.y   += adj / 2;
                                    } else if (adj === ya2) {
                                        if(!(markerA.lock))
                                            markerA.y += adj / 2;

                                        if(!(markerB.lock))
                                            markerB.y   -= adj / 2;
                                    }
                                    //
                                    // var str = 0.1;
                                    // if (adj === xa1) {
                                    //     markerA.vx -= str;
                                    //     markerB.vx += str;
                                    // } else if (adj === xa2) {
                                    //     markerA.x += str;
                                    //     markerB.x -= str;
                                    // } else if (adj === ya1) {
                                    //     markerA.y -= str;
                                    //     markerB.y += str;
                                    // } else if (adj === ya2) {
                                    //     markerA.y += str;
                                    //     markerB.y -= str;
                                    // }

                                    // var normalized = new Vector2(markerB.x, markerB.y)["-"](new Vector2(markerA.x, markerA.y)).normalize();
                                    //
                                    // markerA.vx -= normalized.x;
                                    // markerA.vy -= normalized.y;
                                    // markerB.vx += normalized.x;
                                    // markerB.vy += normalized.y;

                                }
                            }
                        }
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

        return collideRect;

    });
})();