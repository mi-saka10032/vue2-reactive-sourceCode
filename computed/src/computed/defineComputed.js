// defineComputed
import Dep from "../reactive/dep.js";

function noop(a, b, c) {
}

function isServerRendering() {
    return false;
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
};

export default function defineComputed(
    target,
    key,
    userDef
) {
    // 非服务端环境才有缓存效果，当前场景必定为true
    const shouldCache = !isServerRendering();
    // 传入的是方法，computed传统写法
    if (typeof userDef === "function") {
        // 此处默认为true，调用 createComputedGetter 方法，createGetterInvoker 仅作了解
        sharedPropertyDefinition.get = shouldCache
            ? createComputedGetter(key)
            : noop;
        // 传入方法，set为空函数
        sharedPropertyDefinition.set = noop;
    } else {
        // 传入的是get()和set()
        // 不是服务端渲染，调用createComputedGetter
        // 注意，如果computed中某个key不需要缓存，可将cache设置为false
        // 在当前场景中，userDef中仅传入get()和set()，shouldCache 为 true，cache 为 undefined，因此调用 createComputedGetter 方法创建getter
        sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : noop : noop;
        // 传入set方法绑定
        sharedPropertyDefinition.set = userDef.set || noop;
    }
    // 代理到vm实例上
    Object.defineProperty(target, key, sharedPropertyDefinition);
}

// 创建computed的getter方法
function createComputedGetter(key) {
    // 模板上访问计算属性
    return function computedGetter() {
        // 取出创建的 computedWatchers，此处为与key值匹配的watcher实例，在 initComputed 时创建
        const watcher = this._computedWatchers && this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) {
                // 如果依赖的数据发生了变化，通过调用watcher的update函数，吧dirty的值变为true，需要重新计算值
                watcher.evaluate();
            }
            // 真正的关键，解决嵌套watcher的真正方案
            if (Dep.target) {
                // 思路转变，在watcher中收集依赖
                watcher.depend();
            }
            //计算好的参数返回给用户
            return watcher.value;
        }
    };
}
