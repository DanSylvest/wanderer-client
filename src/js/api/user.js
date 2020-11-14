/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import checkToken from "./user/checkToken";
import login from "./user/login";
import register from "./user/register";
import getAuthToken from "./user/getAuthToken";
import getAuthType from "./user/getAuthType";

export default {
    checkToken: checkToken,
    login: login,
    register: register,
    getAuthToken: getAuthToken,
    getAuthType: getAuthType
}