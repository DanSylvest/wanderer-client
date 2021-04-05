/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 4/11/20.
 */

window.logging = true;

let log_level = 0;
const color_default = "color: none";
const color_green = "color: #060";
const log = function () {
    if(!window.logging) return;

    let args = Array.prototype.slice.call(arguments);
    let level = args.shift();
    if (level < log_level) return;
    let status = "";
    let command = "";
    let color = "";
    let offset_right = "";
    switch (level) {
        case log.TRACE:
            offset_right = "  ";
            status = "TRACE";
            command = "trace";
            color = "color:magenta";
            break;
        case log.ERR:
            offset_right = "  ";
            status = "ERROR";
            command = "error";
            color = "color:red";
            break;
        case log.WARN:
            status = "WARNING";
            command = "warn";
            color = "color:orange";
            break;
        case log.INFO:
            offset_right = "   ";
            status = "INFO";
            command = "info";
            color = "color:#05f";
            break;
        case log.DEBUG:
            offset_right = "  ";
            status = "DEBUG";
            command = "log";
            color = "color:none";
            break;
    }
    let time = new Date();

    let h = convert(2, time.getHours());
    let m = convert(2, time.getMinutes());
    let s = convert(2, time.getSeconds());
    let ms = convert(4, time.getMilliseconds());

    let time_string = h + ":" + m + ":" + s + ":" + ms;
    let space = "  ";

    let log_arr = [color_default, color_green, time_string, color_default, color, status, color_default];
    let firt_el = "%c[%c%s%c](%c%s%c)" + offset_right + space + args.shift();
    let result_args = Array.prototype.concat.call([firt_el], log_arr, args);

    console[command].apply(console, result_args);
};

const convert = function (_count, _num) {
    let result = _num.toString();
    let diff = _count - result.length;
    if (diff === 0) return result;
    let a = 0;
    while (a++ < diff) result = "0" + result;
    return result;
};

log.TRACE = 0;
log.ERR = 1;
log.WARN = 2;
log.INFO = 3;
log.DEBUG = 4;

export default log;