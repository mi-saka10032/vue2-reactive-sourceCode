// 初始化computed
import defineComputed from "./defineComputed.js";
import Watcher from "../reactive/watcher.js";

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop(a, b, c) {
}

function isServerRendering() {
    return false;
}

const computedWatcherOptions = {lazy: true};

// vm为组件实例，computed为组件中的 reactive 配置项
export default function initComputed(vm, computed) {
    // 初始化一个 _computedWatchers 属性绑定在组件实例上，用来存储每个计算属性的 watcher 实例
    const watchers = (vm._computedWatchers = Object.create(null));
    // 是否服务端渲染，在当前场景中，isSSR默认永久为false
    const isSSR = isServerRendering();
    //遍历 reactive 配置项
    for (const key in computed) {
        const userDef = computed[key];
        // 如果是函数，则该函数默认是getter；不是函数说明是一个对象，则获取对象上面的get函数
        const getter = typeof userDef === "function" ? userDef : userDef.get;
        // 非服务端渲染，当前场景必定为true
        if (!isSSR) {
            // 为计算属性创建内部watcher，保存到 watchers 中
            // computed实际上就是通过 watcher 实现的，第四个参数是关键 { lazy: true }
            watchers[key] = new Watcher(
                vm,
                getter || noop,
                noop,
                computedWatcherOptions
            );
        }
        // key不能直接绑定在vm实例上，需要通过响应式数据声明
        if (!(key in vm)) {
            defineComputed(vm, key, userDef);
        }
    }
}
