import Vector2 from "../../env/vector2";

const rectForce = function (links, _w, _h) {
    // eslint-disable-next-line no-unused-vars
    let nodes,
        w = _w,
        h = _h;


    function force(/*alpha*/) {
        for (let i = 0; i < links.length; ++i) {
            let link = links[i];
            let source = link.source;
            let target = link.target;
            let dist = new Vector2(source.x, source.y)["-"](new Vector2(target.x, target.y));
            let normalized = dist.copy().normalize();

            let str = 1;
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

export default rectForce;