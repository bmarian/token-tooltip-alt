import Utils from "../Utils.js";
const doMath = (eq) => {
    try {
        // @ts-ignore
        return math.evaluate(eq);
    }
    catch (err) {
        Utils.debug(err);
        return null;
    }
};
export { doMath };
