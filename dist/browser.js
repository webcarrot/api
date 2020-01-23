"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const makeJobPromise = () => {
    let resolve;
    let reject;
    const promise = new Promise((onSuccess, onError) => {
        reject = onSuccess;
        resolve = onError;
    });
    const onSuccess = (data) => {
        if (resolve) {
            resolve(data);
        }
        else {
            setTimeout(() => resolve(data), 1);
        }
    };
    const onError = (error) => {
        if (reject) {
            reject(error);
        }
        else {
            setTimeout(() => reject(error), 1);
        }
    };
    return { promise, onSuccess, onError };
};
exports.makeApi = ({ endpoint, headers, batchTimeout = 5 }) => {
    const fetchHeaders = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
    });
    if (headers) {
        if (headers instanceof Headers) {
            headers.forEach((value, key) => fetchHeaders.set(key, value));
        }
        else if (headers instanceof Array) {
            headers.forEach(([key, value]) => fetchHeaders.set(key, value));
        }
        else if (headers instanceof Object) {
            Object.keys(headers).forEach(key => fetchHeaders.set(key, headers[key]));
        }
    }
    let batchJobs = [];
    let batchTimeoutValue = null;
    const executeBatch = () => {
        batchTimeoutValue = null;
        const batchJobsToDo = batchJobs.filter(({ aborted }) => !aborted);
        const batchJobsAborted = batchJobs.filter(({ aborted }) => aborted);
        batchJobs = [];
        if (batchJobsAborted.length) {
            batchJobsAborted.forEach(job => {
                job.onError(errors_1.makeAbortError(job.action));
            });
        }
        if (batchJobsToDo.length) {
            try {
                fetch(endpoint, {
                    method: "POST",
                    headers: fetchHeaders,
                    body: JSON.stringify({
                        batch: batchJobsToDo
                    })
                }).then(r => r.json().then(data => {
                    if (r.ok) {
                        batchJobsToDo.forEach((job, no) => {
                            if (job.aborted) {
                                job.onError(errors_1.makeAbortError(job.action));
                            }
                            else {
                                const { value, ok } = data[no];
                                if (ok) {
                                    job.onSuccess(value);
                                }
                                else {
                                    job.onError(errors_1.makeError(value, job.action));
                                }
                            }
                        });
                    }
                    else {
                        batchJobsToDo.forEach(job => {
                            if (job.aborted) {
                                job.onError(errors_1.makeAbortError(job.action));
                            }
                            else {
                                job.onError(errors_1.makeError(data, job.action));
                            }
                        });
                    }
                }), err => {
                    batchJobsToDo.forEach(job => {
                        if (job.aborted) {
                            job.onError(errors_1.makeAbortError(job.action));
                        }
                        else {
                            job.onError(errors_1.makeError(err, job.action));
                        }
                    });
                });
            }
            catch (err) {
                batchJobsToDo.forEach(job => {
                    job.onError(errors_1.makeError(err, job.action));
                });
            }
        }
    };
    const addJob = (action, payload) => {
        const { promise, onError, onSuccess } = makeJobPromise();
        const job = {
            action,
            payload,
            aborted: false,
            onError,
            onSuccess
        };
        batchJobs.push(job);
        if (!batchTimeoutValue) {
            batchTimeoutValue = setTimeout(executeBatch, batchTimeout);
        }
        Object.defineProperty(promise, "abort", {
            value: () => {
                if (!job.aborted) {
                    job.aborted = true;
                }
            }
        });
        return promise;
    };
    return (action, payload, batch) => {
        if (batch) {
            return addJob(action, payload);
        }
        else {
            try {
                let aborted = false;
                const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
                const signal = controller ? controller.signal : undefined;
                const promise = fetch(endpoint, {
                    signal,
                    method: "POST",
                    headers: fetchHeaders,
                    body: JSON.stringify({
                        action,
                        payload
                    })
                }).then(r => r.json().then(data => {
                    if (aborted) {
                        throw errors_1.makeAbortError(action);
                    }
                    else if (r.ok) {
                        return data;
                    }
                    else {
                        throw errors_1.makeError(data, action);
                    }
                }), err => {
                    if (err.code === 20) {
                        throw errors_1.makeAbortError(action);
                    }
                    else {
                        throw errors_1.makeError(err, action);
                    }
                });
                Object.defineProperty(promise, "abort", {
                    value: () => {
                        if (!aborted) {
                            aborted = true;
                            if (controller) {
                                controller.abort();
                            }
                        }
                    }
                });
                return promise;
            }
            catch (err) {
                return Promise.reject(errors_1.makeError(err, action));
            }
        }
    };
};
//# sourceMappingURL=browser.js.map