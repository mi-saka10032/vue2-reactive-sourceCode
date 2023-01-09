// deep.js
const seenObjects = new Set(); // 不重复添加

export default function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}

function _traverse(val, seen) {
    let i, keys;
    const isA = Array.isArray(val); // val是否是数组
    const isO = typeof val === "object"; // val是否是对象
    const isF = Object.isFrozen(val); // val是否是冻结对象

    // 如果不是array和object，或者是已经冻结对象（源码上还判断了VNode对象，此处暂时忽略不计）
    if ((!isA && !isO) || isF) {
        return; // 再见
    }
    if (val.__ob__) {
        // 只有object和array才有__ob__属性
        const depId = val.__ob__.dep.id; // 手动依赖收集器的id
        if (seen.has(depId)) {
            // 已经有收集过
            return; // 再见
        }
        seen.add(depId); // 没有被收集，添加
    }

    if (isA) {
        // 是array
        i = val.length;
        while (i--) {
            _traverse(val[i], seen); // 递归触发每一项的get进行依赖收集
        }
    } else {
        // 是object
        keys = Object.keys(val);
        i = keys.length;
        while (i--) {
            _traverse(val[keys[i]], seen); // 递归触发子属性的get进行依赖收集
        }
    }
}
