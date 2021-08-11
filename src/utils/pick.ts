/**
 * Create an object composed of the picked object properties
 * @param  {T extends Record<string, any>} obj
 * @param  {K extends Extract<keyof T, string>} keys
 * @returns {Partial<Pick<T, K>>}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = <T extends Record<string, any>, K extends Extract<keyof T, string>>(
  obj: T,
  keys: readonly K[]
): Partial<Pick<T, K>> => {
  return keys.reduce<Partial<Pick<T, K>>>((accumulator: Partial<Pick<T, K>>, key: K): Partial<Pick<T, K>> => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      accumulator[key] = obj[key];
    }
    return accumulator;
  }, {});
};

export default pick;
