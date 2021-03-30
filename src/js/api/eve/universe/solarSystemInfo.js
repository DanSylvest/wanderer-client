import CustomPromise from "../../../env/promise";

export default function (solarSystemId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "universe", "solarSystemInfo"], {
        solarSystemId: solarSystemId
    });

    return p.native;
}