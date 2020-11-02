import stringMath from "./FallbackMathEngine";
import Utils from "../module/Utils";

const doMath = (eq: string): any => {
    // @ts-ignore
    const mathjs = math;
    if (!mathjs) stringMath(eq);

    try {
        return mathjs.evaluate(eq);
    } catch (err) {
        Utils.debug(err);
        return null;
    }
};

export {doMath};