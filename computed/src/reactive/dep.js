let uid = 0;
export default class Dep {
    static target = null;

    constructor() {
        this.id = uid++;
        // 存储订阅者数组 subscribes
        // 数组里实际存放的是 Watcher 的实例对象
        this.subs = [];
    }

    // 添加watcher依赖到指定的dep实例，当且仅当全局的Dep.target绑定了watcher实例时才会push进去
    depend() {
        if (Dep.target) {
            // 不再由实例调用方法添加依赖
            // this.addSub(Dep.target);
            // 该方法执行顺序在getter执行后，popTarget出栈前
            Dep.target.addDep(this);
        }
    }

    // 通知更新
    notify() {
        // 浅拷贝
        const subs = [...this.subs];
        // 遍历执行watcher实例的update方法更新value
        subs.forEach((s) => s.update());
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    // 借此完善订阅者定向清除方法
    removeSub(sub) {
        remove(this.subs, sub);
    }
}

function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

const targetStack = [];

export function pushTarget(_target) {
    targetStack.push(_target);
    Dep.target = _target;
}

export function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
}
