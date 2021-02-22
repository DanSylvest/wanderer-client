import query from "../../js/env/query";
import printf from "../../js/env/tools/printf";
import cookie from "../../js/env/cookie";
import api from "../../js/api";
import exists from "../../js/env/tools/exists";
import helper from "../../js/utils/helper.js";

let data = query.parse(window.location.search.substring(1));
let authToken = cookie.get("authToken");
cookie.remove("authToken");

let enableAuth = true;
if(!exists(authToken)) {
    enableAuth = false;

    window.vueApp.showErrorModal({
        title: "Attention",
        message: `You can not use token two times. You will be redirect to login page.`,
        callback : () => {
            let page = query.toString({
                page: "login"
            });
            window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
        }
    });
}

const auth = function () {
    api.user.getAuthType(authToken)
        .then(
            type => {
                switch (type) {
                    case "auth":
                        register();
                        break;
                    case "attach":
                        attach();
                        break;
                }
            },
            err => {
                window.vueApp.showErrorModal({
                    title: "Attention",
                    message: helper.extractErrorReason(err),
                    callback : () => {
                        window.location = window.location.origin + window.location.pathname;
                    }
                });
            }
        );
}

const register = function () {
    api.user.register(data.code)
        .then(
            event => {
                cookie.set("token", event.token);

                let page = query.toString({
                    page: "home",
                    item: "currentMap"
                });
                window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
            },
            err => {
                window.vueApp.showErrorModal({
                    title: "Attention",
                    message: helper.extractErrorReason(err),
                    callback : () => {
                        window.location = window.location.origin + window.location.pathname;
                    }
                });
            }
        );
};

const attach = function () {
    api.eve.character.add(data.code)
        .then(
            () => {
                window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, query.toString({
                    page: "home",
                    item: "characters"
                }));
            },
            err => {
                window.vueApp.showErrorModal({
                    title: "Attention",
                    message: helper.extractErrorReason(err),
                    callback : () => {
                        window.location = window.location.origin + window.location.pathname;
                    }
                });
            }
        );
}

enableAuth && auth();