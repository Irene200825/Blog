import Dep from "./ dep"
import { def, isObject } from "./util";


function observe(val) {
    new Observer(value)
}




function defineReactive(obj, key, val) {
    const dep = new Dep()

    const property = Object.getOwnPropertyDescriptor()
    if (property && property.configurable === false) {
        return
    }

    const getter = property && property.get
    const setter = property && property.set

    observe(val)//递归子属性
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

            observe(newVal)//新增的时候，如果值有多层的情况，进行递归
            dep.notify()
        }
    })

}



export class Observer {
    constructor(value) {
        this.value = value
        this.dep = new Dep()
        def(value, '__ob__', this)//向value中加一个__ob__属性,value是当前的Observer对象
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

