import CustomPromise from "../../../env/promise";

export default function (_groupId, _characters) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "updateAllowedCharactersForGroup"], {
        groupId: _groupId,
        characters: _characters
    });

    return p.native;
}