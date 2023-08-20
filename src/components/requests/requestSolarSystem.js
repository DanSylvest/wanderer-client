import cache from '@/js/cache/cache';

/**
 * return data and unsubscribe
 *
 * @param characterId {number}
 * @returns {Promise<*>}
 */
export const requestSolarSystemId = async (characterId) => {
  const location = cache.characters.list.get(characterId).location;
  const unsubscribe = location.subscribe();
  await location.readyPromise();

  const data = location.data();

  unsubscribe();

  return data;
}