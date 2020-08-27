import Dep from "./dep"
import { isObject, hasOwn } from "./util"
import { arrayMethods } from "./array"


function observe(val) {
    //不是对象或者是null
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
        this.dep = new Dep()
        def(value, '__ob__', this)

        if (Array.isArray(value)) {
            value.__proto__ = arrayMethods
            this.observeArray(value)//侦测数组中元素的变化，数组元素的值可能是对象可能是数组等
        } else {
            this.walk(value)
        }

    }

    //会将每一个属性都转换成get/set的形式侦测变化
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }

    /**
   * Observe a list of Array items.
   */
    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }
}


export function defineReactive(obj, key, val) {
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
                if (childOb) {
                    childOb.dep.depend()//这边收集针对数组，如果它的值是对象(包括数组)，把依赖收集到对象的dep上
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
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

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}