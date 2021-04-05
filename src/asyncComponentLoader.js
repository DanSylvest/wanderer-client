/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/16/20.
 */

import Vue from "vue";
// import CustomPromise from "./js/env/promise";
import modules from "./conf/modules";

const asyncComponentLoader = function (_pageId) {
    // let pr = new CustomPromise();
    let info = modules[_pageId];
    let result = Vue.component(info.componentName, () => import("./components/" + info.path));
    // result().then(pr.resolve, pr.reject);
    return result();
}

export default asyncComponentLoader;
