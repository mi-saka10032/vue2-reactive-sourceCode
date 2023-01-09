// array.js
import { def } from "./util.js";

const arrayPrototype = Array.prototype;

export const arrayMethods = Object.create(arrayPrototype);

const methodsNeedChange = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse"
];

methodsNeedChange.forEach((methodName) => {
    // 备份原来的方法
    const original = arrayPrototype[methodName];
    // 定义新方法
    def(
        arrayMethods,
        methodName,
        function () {
            // 执行数组的老方法，保证原API顺利执行
            const result = original.apply(this, arguments);

            // 从顶层对象开始递归调用声明下的数组，已经完成了实例初始化，执行`def(value, "__ob__", this, false);`后当前数组必定包含 __ob__ 属性
            const ob = this.__ob__;

            // 7种方法里有3种方法 push / unshift / splice 能够插入新项，现在要把插入的新项也变为observe响应式数据
            let inserted = [];

            switch (methodName) {
                case "push":
                case "unshift":
                    inserted = arguments; // 指向插入的新项
                    break;
                case "splice":
                    // splice参数是splice(下标[，数量[，插入的新项]])
                    inserted = Array.from(arguments).slice(2); // 指向第三个参数
                    break;
            }

            // 判断有没有要插入的新项
            if (inserted) {
                ob.observeArray(inserted);
            }

            // 改动
            // 数组7方法之一改动时，需要调动数组对象的dep实例开启依赖收集
            ob.dep.notify();

            return result; // 返回原API的原返回值
        },
        false
    );
});
