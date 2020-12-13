import CustomPromise from "../../../env/promise";

export default function (_groupId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "getAllowedCharacters"], {groupId: _groupId});

    return p.native;
}