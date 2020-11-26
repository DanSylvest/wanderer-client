import CustomPromise from "../../../env/promise";

export default function (_mapId, _systemId, _data) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "updateSystem"], {
        mapId: _mapId,
        systemId: _systemId,
        data: _data
    });

    return p.native;
}