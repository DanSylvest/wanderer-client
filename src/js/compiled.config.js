/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/16/20.
 */

import extend from "./env/tools/extend";
import mainConf from "./../conf/main";

let config = extend({}, mainConf);

try {
    const customConf = require("./../conf/custom");

    // eslint-disable-next-line no-console
    console.log('JOipP', `customConf`, customConf)

    extend(config, customConf);
} catch (err) {
    // do nothing
}

export default config;