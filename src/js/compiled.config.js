/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 10/16/20.
 */

import extend from "./env/tools/extend";
import mainConf from "./../conf/main";

let config = extend({}, mainConf);

try {
    const customConf = require("./../conf/custom");
    extend(config, customConf);
} catch (err) {
    // do nothing
}

export default config;