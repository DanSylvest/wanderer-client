import CustomPromise from "../../../../env/promise";

export default function (_mapId, _systemId, _data) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "solarSystem", "update"], {
        mapId: _mapId,
        systemId: _systemId,
        data: _data
    });

    return p.native;
}