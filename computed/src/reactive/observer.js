// observer.js 观察者类
// 数据变量的观察者类
// 作用1：为闭包变量创建实例对象，只要递归结构中存在复杂类型就一定会创建新的实例对象
// 作用2：在实例上声明一个响应式变化的 __ob__ 对象，现阶段暂时用不上
// 作用3：遍历实例的全部key值并开启响应式数据劫持
import { def } from "./util.js";
import defineReactive from "./defineReactive.js";
import observe from "./observe";
import { arrayMethods } from "./array.js";
import Dep from "./dep.js";

export default class Observer {
    constructor(value) {
        // 改动
        // 为了确保复杂对象可以被正确侦听，需要给对象的 __ob__ 绑定dep实例
        this.dep = new Dep();
        // 给需要开启监听的对象声明绑定一个初始化的Observer类，key值为__ob__，且不可被枚举
        def(value, "__ob__", this, false);
        if (Array.isArray(value)) {
            // 1.如果是数组，将这个数组的原型指向重写后的arrayMethods
            // `Object.setPrototypeOf`：将第一个参数的原型对象指向到第二个参数
            Object.setPrototypeOf(value, arrayMethods);
            // 2.让数组实现响应式
            this.observeArray(value);
        } else {
            // 遍历value的key，对每一个属性都开启监听
            this.walk(value);
        }
    }

    // 遍历
    walk(value) {
        for (let key in value) {
            defineReactive(value, key);
        }
    }

    // 数组的特殊遍历
    observeArray(arr) {
        for (let i = 0, l = arr.length; i < l; i++) {
            // 逐项observe
            observe(arr[i]);
        }
    }
}
