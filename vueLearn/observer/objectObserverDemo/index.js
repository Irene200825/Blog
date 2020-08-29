import Dep from "./dep"
import { isObject, hasOwn } from "./util"


function observe(val) {
    if (!isObject(value)) {
        return
    }

    let ob
    //如果value是响应式的，保证不重复侦测
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observe) {
        ob = value.__ob__
    } else {
        ob = new Observer(val)
    }

    return ob
}


export class Observer {
    constructor(value) {
        this.value = value
        def(value, '__ob__', this)
        this.walk(value)
    }

    //会将每一个属性都转换成get/set的形式侦测变化
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}

function defineReactive(obj, key, val) {
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor()
    if (property && property.configurable === false) {
        return
    }

    const getter = property && property.get
    const setter = property && property.set

    let childOb = observe(val)//递归子属性
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                dep.depend()
            }
            return value
        },
        set: function (newVal) {
            const value = getter ? getter.call(obj) : val
            //两则值相同，包括null，es6可以用Object.is(newVal,value)
            if (newVal === value || (newVal != newVal && value != value)) {
                return;
            }

            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }

            childOb = observe(newVal)//新增的时候，如果值有多层的情况，进行递归
            dep.notify()
        }
    })

}





