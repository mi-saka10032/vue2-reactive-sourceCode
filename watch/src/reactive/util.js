// util.js __ob__属性定义
export const def = function (obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value,
        enumerable,
        writable: true,
        configurable: true
    });
};
