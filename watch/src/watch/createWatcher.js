import Watcher from "../reactive/watcher.js";
import { popTarget, pushTarget } from "../reactive/dep.js";

function noop() {
}

export default function initWatcher(vm, expOrFn, cb = noop, options = {}) {
    options.user = true;
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
        pushTarget();
        try {
            cb.call(vm, watcher.value);
        } catch (e) {
            console.log(e);
        }
        popTarget();
    }
};
