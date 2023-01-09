import observe from "./reactive/observe.js";
import initWatcher from "./watch/createWatcher.js";

const data = {
    a: {
        m: {
            n: 5
        }
    },
    b: 10,
    c: [1, 2, 3, 4]
};

observe(data);
initWatcher(data, "a", (newValue, oldValue) => {
    console.log("~~~ a内部发生变化旧值是", oldValue);
    console.log("~~~ a内部发生变化新值是", newValue);
}, { deep: true });
initWatcher(data, "b", (newValue, oldValue) => {
    console.log("!!! b旧值是", oldValue);
    console.log("!!! b新值是", newValue);
}, { immediate: true });
initWatcher(data, "c", (newValue, oldValue) => {
    console.log("@@@ c旧值是", oldValue);
    console.log("@@@ c新值是", newValue);
}, { deep: true });
data.a.m.n = 77;
data.c.push(5, 6, 7);
setTimeout(() => {
    data.c[0] = 999;
}, 2000)

