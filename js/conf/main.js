(function () {
    var modulePath = "conf/main";

    define(modulePath, [], function () {
        var config = {
            product: {
                version: "1.0.0",
                state: "beta",
                name: "wanderer"
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
                        response_type: "code",
                        client_id: "", // application Client Id,
                        scope: [
                            "esi-location.read_location.v1",
                            "esi-location.read_ship_type.v1",
                            "esi-location.read_online.v1"
                        ]
                    },
                    server:  {
                        host: "login.eveonline.com", // login server
                        proto: "https:", // protocol
                        content_type: "application/x-www-form-urlencoded"
                    }
                }
            }
        };

        return config;
    });
})();
