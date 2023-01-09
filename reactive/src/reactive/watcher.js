import { pushTarget, popTarget } from "./dep.js";

// watcher.js
let uid = 0;
export default class Watcher {
    constructor(data, expression, cb) {
        // data: 数据对象，如obj
        // expression：表达式，如b.c，根据data和expression就可以获取watcher依赖的数据
        // cb：依赖变化时触发的回调
        this.id = uid++;
        this.data = data;
        this.expression = expression;
        this.cb = cb;
        // 初始化watcher实例时订阅数据
        this.value = this.get();
    }

    get() {
        // 1.新增watcher目标target的push和pop步骤
        // 2.因为js为单线程执行，因此同一时刻仅有一个watcher实例执行，Dep.target必定是当前正处于实例化过程中的watcher
        // 3.等待value值成功析出之后，将当前实例从targetStack中弹出，保证父子对象的两个watcher实例初始化时不会出现target冲突
        let value;
        pushTarget(this);
        try {
            value = parsePath(this.data, this.expression);
        } finally {
            popTarget();
        }
        return value;
    }

    // 当收到数据变化的消息时执行该方法，从而调用cb
    update() {
        const value = this.get();
        // 基本类型，新旧值不相等才会执行更新与回调；复杂类型，触发update时必定更新，vue2特性，因此oldValue与newValue也总是相等
        if (value !== this.value || typeof value === "object") {
            const oldValue = this.value;
            this.value = value; // 对存储的数据进行更新
            this.cb.call(this.data, this.value, oldValue); // 调用回调函数，对标Vue2-watch的handler函数
        }
    }
}

function parsePath(obj, expression) {
    const segments = expression.split(".");
    for (let key of segments) {
        if (!obj) return;
        obj = obj[key];
    }
    return obj;
}
