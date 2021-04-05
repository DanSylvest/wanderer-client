/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/16/20.
 */
 
import config from "./compiled.config";
import API from "./utils/api";
import api from "./api/_dir";

export default new API({
    protocol: config.connection.socket.proto,
    host: config.connection.socket.host,
    port: config.connection.socket.port,
    handlers: api
})