import Dep from "./dep.js"
import { isObject, hasOwn, def } from "./util.js"
import Watcher from "./watcher.js"


function observe(val) {
    if (!isObject(val)) {
        return
    }

    let ob
    //如果value是响应式的，保证不重复侦测
    if (hasOwn(val, '__ob__') && val.__ob__ instanceof Observe) {
        ob = val.__ob__
    } else {
        ob = new Observer(val)
    }

    return ob
}


class Observer {
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

    const property = Object.getOwnPropertyDescriptor(obj, key)
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
                console.log("收集dep", key , dep)

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
            console.log("触发的dep",dep.id)
            dep.notify()
        }
    })

}


let data = {
    person: {
        name: {
            firstName: 'Irene',
            lastName: 'Zhang'
        },
        age: 23
    }
}


console.log('------new Observer------')
let observer = new Observer(data)
console.log("侦测对象data:", observer)

console.log('------new Watcher person.name------')
new Watcher(data, 'person.name', function (val, newVal) {
    console.log("Watcher回调")
})


console.log('------修改person.name------')
data.person.name = {
    firstName: 'hongan',
    lastName: 'Zhang'
}


// console.log('------修改person------')
// data.person = {
//     name: {
//         firstName: 'hongan',
//         lastName: 'Zhang'
//     },
//     age: 23
// }

