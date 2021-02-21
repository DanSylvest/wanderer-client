import CustomPromise from "../../../env/promise";

export default function (_groupId, _characters) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "updateAllowedCharacters"], {
        groupId: _groupId,
        characters: _characters
    });

    return p.native;
}