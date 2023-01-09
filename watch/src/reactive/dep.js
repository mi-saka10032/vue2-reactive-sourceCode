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
            this.addSub(Dep.target);
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
}

const targetStack = [];

export function pushTarget(_target) {
    targetStack.push(Dep.target);
    Dep.target = _target;
}

export function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
}
