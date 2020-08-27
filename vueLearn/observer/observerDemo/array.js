import { def } from "../objectObserverDemo/util";

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

['push',
'pop',
'shift',
'unshift',
'splice',
'sort',
    'reverse'
]
    .forEach(function (method) {
        const original = arrayProto[method]
        def(arrayMethods, method, function mutator(...args) {
            const result = original.apply(this, args)
            const ob = this.__ob__
            let inserted
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args
                    break;
                case 'splice':
                    inserted = args.slice(2)//第三个参数开始是增加的内容
                    break
            }
            // if (inserted) ob.
            ob.dep.notify()//触发依赖
            return result
        })
    });