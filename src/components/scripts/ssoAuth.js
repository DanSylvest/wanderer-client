import query from "../../js/env/query";
import printf from "../../js/env/tools/printf";
import cookie from "../../js/env/cookie";
import api from "../../js/api";
import exists from "../../js/env/tools/exists";

let data = query.parse(window.location.search.substring(1));
let authToken = cookie.get("authToken");
cookie.remove("authToken");

let enableAuth = true;
if(!exists(authToken)) {
    enableAuth = false;
    alert("You can not use token two times. You will back to login page and try again.");
    let page = query.toString({
        page: "login"
    });
    window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
}

const auth = function () {
    api.user.getAuthType(authToken).then(function (_type) {
        switch (_type) {
            case "auth":
                register();
                break;
            case "attach":
                attach();
                break;
        }
    }.bind(this), function (_err) {
        alert(JSON.stringify(_err, true, 3));
    }.bind(this));
}

const register = function () {
    api.user.register(data.code).then(function(_event){
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
};

const attach = function () {
    api.eve.character.add(data.code).then(function(){
        let page = query.toString({
            page: "home",
            item: "characters"
        });
        window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
    }.bind(this), function(_err){
        // todo need show dialog with error response
        alert(JSON.stringify(_err, true, 3));
        window.location = window.location.origin + window.location.pathname;
    }.bind(this));
}

enableAuth && auth();