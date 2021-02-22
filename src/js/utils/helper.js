import log from "./log.js";
import exists from "../env/tools/exists.js";

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