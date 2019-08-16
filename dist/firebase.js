"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
exports.makeApi = ({ functions }) => {
    return (action, payload) => {
        const promise = new Promise((resolve, reject) => {
            const func = functions.httpsCallable(action);
            func(payload).then(result => {
                if (aborted) {
                    reject(errors_1.makeAbortError(action));
                }
                else {
                    resolve(result.data);
                }
            }, err => {
                if (aborted) {
                    reject(errors_1.makeAbortError(action));
                }
                else {
                    reject(errors_1.makeError(err, action));
                }
            });
        });
        let aborted = false;
        Object.defineProperty(promise, "abort", {
            value: () => {
                if (!aborted) {
                    aborted = true;
                }
            }
        });
        return promise;
    };
};
//# sourceMappingURL=firebase.js.map