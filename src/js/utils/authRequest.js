/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/30/20.
 */

import config from "../compiled.config";
import query from "../env/query";

export default function authRequest(_responseQuery) {
    var response_url = location.origin + location.pathname + "?" + _responseQuery;

    var SSO_HOST = config.eve.sso.server.host;
    var SSO_PROTO = config.eve.sso.server.proto;

    var RESPONSE_TYPE = config.eve.sso.client.response_type;
    var CLIENT_ID = config.eve.sso.client.client_id;
    var SCOPE = config.eve.sso.client.scope.join(" ");

    var data = {
        response_type: RESPONSE_TYPE,
        client_id: CLIENT_ID,
        scope: SCOPE,
        state: "ccp_auth_response",
        redirect_uri: response_url
    };
    var destination = SSO_PROTO + "//" + SSO_HOST + "/oauth/authorize/?";

    var url = destination + query.toString(data);
    console.log("CCP_AUTH_URL " + url);
    location.href = url;
}