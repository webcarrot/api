"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
exports.makeApi = ({ actions, context }) => (action, payload) => {
    let aborted = false;
    const promise = new Promise((resolve, reject) => {
        if (aborted) {
            reject(errors_1.makeAbortError(action));
        }
        else if (action in actions) {
            actions[action](payload, context).then((data) => {
                if (!aborted) {
                    resolve(data);
                }
                else {
                    reject(errors_1.makeAbortError(action));
                }
            }, (err) => reject(aborted ? errors_1.makeAbortError(action) : errors_1.makeError(err, action)));
        }
        else {
            reject(errors_1.makeError({
                message: `Unknown action "${action}"`,
                name: "ActionUnknown"
            }, action));
        }
    });
    Object.defineProperty(promise, "abort", {
        value: () => {
            aborted = true;
        }
    });
    return promise;
};
//# sourceMappingURL=node.js.map