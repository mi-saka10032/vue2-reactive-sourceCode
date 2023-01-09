import observe from "./reactive/observe.js";
import Watcher from "./reactive/watcher.js";

const obj = {
    a: {
        m: {
            n: 5
        }
    },
    b: 10,
    c: [1, 2, 3, 4]
};

observe(obj);
console.log("obj", obj);
new Watcher(obj, "b", (val, oldVal) => {
    console.log(`watcher,b从${oldVal}变成了${val}`);
});
new Watcher(obj, "c", (val, oldVal) => {
    console.log(`watcher,c从${oldVal}变成了${val}`);
});
obj.b = 50;
obj.c.push(5, 6);
