import Utils from '../Utils.js';

export default function doMath(eq) {
  try {
    return math.evaluate(eq);
  } catch (err) {
    Utils.debug(err);
    return null;
  }
}
