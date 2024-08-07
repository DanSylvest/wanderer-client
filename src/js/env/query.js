import extend from "./tools/extend"

export const parseQuery = function (_query) {
    var out = Object.create(null);

    var variablesArr = _query.split("&");
    for (var a = 0; a < variablesArr.length; a++) {
        var keyValuesArr = variablesArr[a].split("=");
        out[keyValuesArr[0]] = keyValuesArr[1];
    }

    return out;
};

export const queryToString = function (_object) {
    var res_arr = [];
    for(var k in _object){
        var val = _object[k];
        var loc = k + "=" + val;
        res_arr.push(loc);
    }
    return res_arr.join("&");
};

export const searchObject = function () {
    var out = Object.create(null);

    if(window.location.search !== "") {
        var searchQuery = parseQuery(window.location.search.substring(1));
        extend(out, searchQuery);
    }

    return out;
};

export default {
    searchObject: searchObject,
    parse: parseQuery,
    toString: queryToString,
};