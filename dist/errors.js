"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAbortError = (action) => {
    const error = new Error(`Action "${action}" aborted`);
    error.name = "AbortError";
    return error;
};
exports.makeError = (data, action) => {
    const error = new Error(`Action "${action}" error`);
    error.name = "ActionError";
    if (data && data instanceof Object) {
        Object.assign(error, data);
    }
    return error;
};
//# sourceMappingURL=errors.js.map