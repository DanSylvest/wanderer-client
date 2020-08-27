/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 8/26/20.
 */

(function () {
    var modulePath = "conf/pages";

    define(modulePath, [], function () {
        var pages = {
            home: {
                isProtected: true
            },
            ssoAuthResponse: {
                isProtected: true
            },
            login: {
                isProtected: false
            },
            ssoAuthResponseForLogin: {
                isProtected: false
            }
        };

        return pages;
    });
})();