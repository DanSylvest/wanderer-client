import axios from 'axios';
import { queryToString } from '../env/query';

/**
 *
 * @param props.categories {Array.<'character'|'corporation'|'alliance'>}
 * @param props.language
 * @param props.searchString
 * @param props.strict
 * @param props.datasource
 * @returns {Promise<{
 *   character: Array.<number>
 * }>}
 */
export const getSearch = async (props) => {
  const {
    categories = [],
    language = 'en',
    search = '',
    strict = false,
    datasource = 'tranquility',
  } = props;

  try {
    const opts = { datasource, language, categories: categories.join(','), search, strict };
    const res = await axios.get(`https://esi.evetech.net/latest/search/?` + queryToString(opts));
    return res.data;
  } catch (e) {
    console.error(e);
  }
};