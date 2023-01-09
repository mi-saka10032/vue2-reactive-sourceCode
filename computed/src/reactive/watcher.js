// watcher.js
import { pushTarget, popTarget } from "./dep.js";

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
            this.lazy = !!options.lazy; // this.lazy=true 默认不执行 这是一个 computed
        }
        this.dirty = this.lazy; // computed 看是否需要重新取值
        // dep依赖实例数组结构、新增的dep数组
        this.deps = [];
        this.newDeps = [];
        // depId去重set结构、新增的depId去重set结构，防止引入重复dep
        this.depIds = new Set();
        this.newDepIds = new Set();
        if (typeof expression === "function") {
            this.getters = expression;
        }
        // 初始化watcher实例时订阅数据
        // lazy 留住value
        this.value = this.lazy ? undefined : this.get();
    }

    get() {
        // 1.新增watcher目标target的push和pop步骤
        // 2.因为js为单线程执行，因此同一时刻仅有一个watcher实例执行，Dep.target必定是当前正处于实例化过程中的watcher
        // 3.等待value值成功析出之后，将当前实例从targetStack中弹出，保证父子对象的两个watcher实例初始化时不会出现target冲突
        let value;
        pushTarget(this);
        try {
            // getter标记，此时触发dep.depend，Dep.target.addDep(this)开始收集依赖，实际上还是在watcher实例中执行收集
            value = this.getters.call(this.data, this.data);
        } finally {
            popTarget();
            // 上方已经重新执行过一次dep收集，此时存储在newDeps和newDepIds中的数据进行无用id判断后真正落实到deps和depIds中
            this.cleanupDeps();
        }
        return value;
    }

    update() {
        // 修改属性计算属性依赖的变量重置 dirty，说明value已被修改，外部判断dirty为true会调用evaluate执行一次get()，最后将dirty置为false
        if (this.lazy) {
            this.dirty = true;
        }
    }

    evaluate() {
        //当走到这里时，页面正在渲染中 Dep.target, 已经有一个渲染 watcher 了
        this.value = this.get();
        // 修改了计算属性里面脏值，直到下次value改变之前，evaluate不会再次调用
        this.dirty = false;
    }

    // 增加关联的dep依赖实例到当前监听器watcher实例中
    addDep(dep) {
        const id = dep.id;
        if (!this.newDepIds.has(id)) {
            // 当前新增的dep实例中没有当前dep.id，则加入这个dep实例，避免重复引入
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            // 此处使用了十分巧妙的class解耦，看似无关
            // 实际上在这里判断出当前dep.id不存在于已有depsId结构中时
            // 转而将参数中的dep实例取出，反过来调用dep.addSub实例方法
            // 保证dep实例中成功加入当前watcher实例，以后的setter更新
            // 必定调用dep.notify通知到当前watcher实例引发更新
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }

    // 在watcher实例中开启依赖收集，数量繁多的dep依赖实例与数量稀少的订阅者watcher实例
    // 相互之间构成你中有我，我中有你的关系
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }

    // 每次执行完依赖更新后
    // 多余的dep实例，调用dep.removeSub移除调当前watcher
    // 新增deps实例的方法后清空用于新增的数据结构
    cleanupDeps() {
        let i = this.deps.length;
        while (i--) {
            const dep = this.deps[i];
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        }
        // 1. exchange depIds <--> newDepIds; 2. clear newDepIds
        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        // 1. exchange deps <--> newDeps; 2. clear newDeps
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    }
}
