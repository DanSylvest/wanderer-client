import log from "./log.js";

/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/20/21.
 */
 
const helper = {
    errorHandler (context, err) {
        log(log.ERR, JSON.stringify(err, null, 3));
        context.$notify({
            group: 'mainNotifications',
            title: 'Something going wrong!',
            text: err.message,
            type: 'error'
        });
    },
    dummy (){}
}

export default helper;