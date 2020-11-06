import Utils from "../module/Utils";

const doMath = (eq: string): any => {
    try {
        // @ts-ignore
        return math.evaluate(eq);
    } catch (err) {
        Utils.debug(err);
        return null;
    }
};

export {doMath};