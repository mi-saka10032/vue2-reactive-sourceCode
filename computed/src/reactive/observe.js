// 值类型监听判断函数，也是对象观察者模式初始化执行或后续值改变时触发的函数
// 作用1：为复杂数据类型，且没有初始化过Observer实例对象的变量，作new Observer操作
// 作用2：作为defineReactive响应式数据劫持函数的递归操作入口函数，实现多层级复杂类型的递归响应式数据劫持
import Observer from "./observer.js";

export default function observe(value) {
    // 基本类型不再往下执行，递归的跳出条件
    if (typeof value !== "object") return;
    let ob;
    if (typeof value.__ob__ !== "undefined") {
        // 当对象的 __ob__ 不为 undefined 时，说明value已经初始化创建过Observer实例了，此时不再执行new Observer，__ob__是响应式的
        ob = value.__ob__;
    } else {
        // 对象不存在 __ob__ 属性时，new Observer实例对象并初始化value值
        ob = new Observer(value);
    }
    return ob;
}
