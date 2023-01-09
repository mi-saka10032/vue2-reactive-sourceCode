import observe from "./reactive/observe.js";
import initComputed from "./computed/initComputed.js";

let visitCount = 0;

const vm = {
    data: {
        a: {
            m: {
                n: 5
            },
            x: 20
        },
        b: 10,
        c: [1, 2, 3, 4],
        d: 20,
        e: 30
    },
    computed: {
        res() {
            console.log("访问res申请通过，访问次数", ++visitCount, "次");
            const arr = this.data.c.reduce((a, b) => a + b, 0);
            return this.data.b + arr;
        },
        dbRes: {
            get() {
                return this.data.d + this.data.e;
            },
            set(value) {
                this.data.d = value - this.data.e;
            }
        },
        comRes() {
            return this.res + 1;
        }
    }
};

observe(vm.data);
initComputed(vm, vm.computed);
vm.data.c = [1, 2, 3, 4, 5];
vm.data.b = 15;
console.log('monitor', vm.res);
console.log('monitor', vm.comRes);
vm.data.b = 20;
console.log('monitor', vm.res);
console.log('monitor', vm.comRes);
