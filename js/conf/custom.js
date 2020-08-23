(function () {
    var modulePath = "conf/custom";

    define(modulePath, [], function () {
        var config = {
            connection: {
                socket: {
                    host: "",
                    proto: "ws",
                    port: ""
                }
            },
            eve: {
                sso: {
                    client: {
                        client_id: "", // application Client Id,
                    }
                }
            }
        };

        return config;
    });
})();
