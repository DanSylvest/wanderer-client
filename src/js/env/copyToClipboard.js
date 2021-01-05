/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 1/5/21.
 */

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

export default copyToClipboard;