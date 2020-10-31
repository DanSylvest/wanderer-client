import Vector2 from "../../env/vector2";

const collideRect = function (_w, _h) {
    let nodes,
        w = _w,
        h = _h;

    function force() {
        let offsetTop = (h / 2) + 5;
        let offsetLeft = (w / 2) + 5;
        let passes = 1;
        let passesCount = 0;

        while (passesCount < passes) {
            passesCount++;

            for (let a = 0; a < nodes.length; a++) {
                let markerA = nodes[a];

                if(markerA.fx && !markerA.lock) continue;

                let o1 = new Vector2(markerA.x - offsetLeft, markerA.y - offsetTop);
                let o2 = new Vector2(markerA.x + offsetLeft, markerA.y + offsetTop);

                for (let b = 0; b < nodes.length; b++) {
                    let markerB = nodes[b];

                    if(markerB.fx&& !markerB.lock) continue;

                    if (a !== b) {
                        let p1 = new Vector2(markerB.x - offsetLeft, markerB.y - offsetTop);
                        let p2 = new Vector2(markerB.x + offsetLeft, markerB.y + offsetTop);

                        let intersect = (p1.x <= o2.x && o1.x <= p2.x && p1.y <= o2.y && o1.y <= p2.y);

                        if (intersect) {
                            let xa1 = o2.x - p1.x, // shift obj left , p right
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
                            // let str = 0.1;
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

                            // let normalized = new Vector2(markerB.x, markerB.y)["-"](new Vector2(markerA.x, markerA.y)).normalize();
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

export default collideRect;