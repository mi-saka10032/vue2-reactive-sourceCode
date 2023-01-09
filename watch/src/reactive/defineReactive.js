// defineReactive.js
// 响应式数据劫持的核心函数
// 作用1：生成val闭包变量，用以劫持数据
// 作用2：对val变量开启observe类型判断与监听，生成递归结构的观察者类
import Dep from "./dep.js";
import observe from "./observe.js";

export default function defineReactive(data, key, val = data[key]) {
    const dep = new Dep();
    // 定义响应式数据前，先执行一次值类型判断，如果为复杂类型，则会new Observer实例同时遍历key值进入defineReactive的递归执行，直到key的value值为基本类型为止
    let childOb = observe(val);
    Object.defineProperty(data, key, {
        // 可枚举
        enumerable: true,
        // 可以被配置，比如可以被delete
        configurable: true,
        // getter
        get() {
            console.log(`你试图访问${key}属性`);
            // 重要！！！get收集依赖
            dep.depend();
            // 改动
            // 完善对象的依赖收集
            // childOb通过observe嵌套执行，目的是确保父对象内部的子对象可以正确执行依赖收集
            if (childOb) {
                childOb.dep.depend();
            }
            return val;
        },
        // setter
        set(newValue) {
            console.log(`你试图改变${key}属性`, newValue);
            if (val === newValue) {
                return;
            }
            val = newValue;
            childOb = observe(newValue);
            // 重要！！！set更新依赖
            dep.notify();
        }
    });
}
