import CustomPromise from "../../../../env/promise";

export default function (_mapId, _linkId, _data) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "link", "update"], {
        mapId: _mapId,
        linkId: _linkId,
        data: _data
    });

    return p.native;
}