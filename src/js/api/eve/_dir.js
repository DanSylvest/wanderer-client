/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/29/20.
 */

import alliance         from "./alliance/_dir";
import character        from "./character/_dir";
import corporation      from "./corporation/_dir";
import group            from "./group/_dir";
import map              from "./map/_dir";
import subscribeStatus  from "./subscribeStatus";

export default {
    alliance: alliance,
    character: character,
    corporation: corporation,
    map: map,
    group: group,
    subscribeStatus: subscribeStatus,
}