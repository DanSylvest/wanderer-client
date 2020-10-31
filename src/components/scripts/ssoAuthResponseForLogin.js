import query from "../../js/env/query";
import printf from "../../js/env/tools/printf";
import cookie from "../../js/env/cookie";
import api from "../../js/api";

let data = query.parse(window.location.search.substring(1));

api.user.register(1, {
    code: data.code
}).then(function(_event){
    cookie.set("token", _event.token);

    let page = query.toString({
        page: "home",
        item: "currentMap"
    });
    window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
}.bind(this), function(_err){
    // todo need show dialog with error response
    alert(JSON.stringify(_err, true, 3));
    window.location = window.location.origin + window.location.pathname;
}.bind(this));

