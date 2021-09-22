import axios from "axios";
import {queryToString} from "../env/query";

/**
 *
 * @param categories {Array.<'character'|'corporation'|'alliance'>}
 * @param language
 * @param searchString
 * @param strict
 * @param datasource
 * @returns {Promise<{
 *   character: Array.<number>
 * }>}
 */
export const getSearch = async ({
                                  categories = [],
                                  language = 'en',
                                  search = '',
                                  strict = false,
                                  datasource = 'tranquility'
                                }) => {
  try {
    const opts = { datasource, language, categories: categories.join(','), search, strict }
    const res = await axios.get(`http://esi.evetech.net/latest/search/?` + queryToString(opts));
    return res.data;
  } catch (e) {
    console.error(e);
  }
}