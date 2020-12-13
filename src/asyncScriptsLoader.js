/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 10/16/20.
 */

// import Vue from "vue";
// import CustomPromise from "./js/env/promise";
import modules from "./conf/modules";

const asyncScriptsLoader = function (_pageId) {
    // let pr = new CustomPromise();
    let info = modules[_pageId];
    let result = () => import("./components/" + info.path);
    // result().then(pr.resolve, pr.reject);
    return result();
}

export default asyncScriptsLoader;
