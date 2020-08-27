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
                        client_id: "165d6d6cab4a4e57a6afe7992f2f8400", // application Client Id,
                    }
                }
            }
        };

        return config;
    });
})();
