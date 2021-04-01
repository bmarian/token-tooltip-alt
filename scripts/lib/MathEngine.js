import { debug } from '../TTAUtils/TTAUtils.js';

export default function doMath(eq) {
  try {
    return math.evaluate(eq);
  } catch (err) {
    debug(err);
    return null;
  }
}
