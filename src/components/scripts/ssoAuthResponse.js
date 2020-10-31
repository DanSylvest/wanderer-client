import query from "../../js/env/query";
import printf from "../../js/env/tools/printf";
import api from "../../js/api";

var data = query.parse(window.location.search.substring(1));

api.eve.character.add(data.code).then(function(){
    let page = query.toString({
        page: "home",
        item: "characters"
    });
    window.location = printf("%s%s?%s", window.location.origin, window.location.pathname, page);
}.bind(this), function(_err){
    // todo need show dialog with error response
    alert(JSON.stringify(_err, true, 3));
    window.location = window.location.origin + window.location.pathname;
}.bind(this));
