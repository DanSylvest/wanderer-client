/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */

class Axis {
    constructor (_min, _range) {
        this.min = _min;
        this.range = _range;

        Object.defineProperty(this, "max", {
            get: function() { return this.min + this.range; }.bind(this),
            set: function(val) { this.range = val - this.min; }.bind(this),
        })
    }
    copy () {
        return new Axis(this.min, this.range)
    }
}

export default Axis;