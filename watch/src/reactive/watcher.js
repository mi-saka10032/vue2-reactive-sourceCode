import { pushTarget, popTarget } from "./dep.js";
import traverse from "./traverse.js";

// watcher.js
let uid = 0;
export default class Watcher {
    constructor(data, expression, cb, options) {
        // data: 数据对象，如obj
        // expression：表达式，如b.c，根据data和expression就可以获取watcher依赖的数据
        // cb：依赖变化时触发的回调
        this.id = uid++;
        this.data = data;
        this.expression = expression;
        this.cb = cb;
        if (options) {
            // default: true
            this.user = true
            this.deep = !!options.deep
        }

        if (typeof expression === "function") {
            this.getters = expression;
        } else {
            this.getters = parsePath(expression);
        }
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
            value = this.getters.call(this, this.data)
            console.log(value);
            if (this.deep) {
                traverse(value)
            }
        } finally {
            popTarget();
        }
        return value;
    }

    // 当收到数据变化的消息时执行该方法，从而调用cb
    update() {
        const newValue = this.get();
        // 基本类型，新旧值不相等才会执行更新与回调；复杂类型，触发update时必定更新，vue2特性，因此oldValue与newValue也总是相等
        if (newValue !== this.value || typeof newValue === "object") {
            const oldValue = this.value;
            this.value = newValue; // 对存储的数据进行更新
            if (this.user) {
                this.cb.call(this.data, this.value, oldValue); // 调用回调函数，对标Vue2-watch的handler函数
            }
        }
    }
}

// 属性路径解析，通过'a.b.m.n'的字符串解析出对象内部的属性值
function parsePath(path) {
    path = path.split(".");
    return function (obj) {
        path.forEach((key) => {
            obj = obj[key];
        });
        return obj;
    };
}
