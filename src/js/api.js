/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 10/16/20.
 */
 
import config from "./compiled.config";
import API from "./utils/api";
import __root from "./api/__root";

export default new API({
    protocol: config.connection.socket.proto,
    host: config.connection.socket.host,
    port: config.connection.socket.port,
    handlers: __root
})