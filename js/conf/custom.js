(function () {
    var modulePath = "conf/custom";

    define(modulePath, [], function () {
        var config = {
            app: {
                title: "Wanderer the mapper"
            },
            connection: {
                socket: {
                    host: "",
                    proto: "ws",
                    port: "1400"
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
