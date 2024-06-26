import log from "./log.js";
import exists from "../env/tools/exists.js";

/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/20/21.
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
    infoMessage (context, message, { title = 'Notification', type = 'success' } = {}) {
        context.$notify({
            group: 'mainNotifications',
            title,
            text: message,
            type
        });
    },
    dummy (){},
    extractErrorReason (err) {
        if(exists(err.data) && exists(err.data.handledError)) {
            return this.extractErrorReason(err.data.handledError)
        } else if(exists(err.message)) {
            return err.message;
        }
    }
}

export default helper;