import { pushTarget, popTarget } from "./dep.js"
import { isObject } from "./util.js"

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/
export function parsePath(path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}


export default class Watcher {
    constructor(vm, expOrFn, cb, options) {

        this.deps = []
        this.depIds = new Set()

        this.vm = vm

        // options
        if (options) {
            this.deep = !!options.deep
        } else {
            this.deep = false
        }


        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn)
        }
        this.cb = cb
        this.value = this.get()
    }

    get() {
        pushTarget(this)//把当前的Watcher保存到Dep静态成员target上，作用是当触发c属性上的get函数时，可以从全局取到当前这个Watcher
        let value
        const vm = this.vm
        try {
            //假如expOrFn为a,b,c,这段代码就相当于读取vm.a.b.c的值，因为读取值肯定会触发c属性上的get函数，会自动收集依赖
            value = this.getter.call(vm, vm)
        } catch (e) {
            throw e
        } finally {
            if (this.deep) {
                traverse(value)
            }
            popTarget()//清除Dep.target的值
        }
        return value

    }

    addDep(dep) {
        const id = dep.id
        //如果没有订阅，才能存储
        if (!this.depIds.has(id)) {
            this.depIds.add(id)
            this.depIds.push(dep)
            dep.addSub(this)
        }
    }


    update() {
        const oldValue = this.value//原来的值
        this.value = this.get()//新的值
        this.cb.call(this.vm, this.value, oldValue)
    }


    teardown() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
    }
}



/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
const seenObjects = new Set()
function traverse(val) {
    seenObjects.clear()
    _traverse(val, seenObjects)
}

//递归取值
function _traverse(val, seen) {
    let i, keys
    const isA = Array.isArray(val)
    if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
        return
    }
    if (val.__ob__) {
        const depId = val.__ob__.dep.id
        if (seen.has(depId)) {
            return
        }
        seen.add(depId)
    }
    if (isA) {
        i = val.length
        while (i--) _traverse(val[i], seen)
    } else {
        keys = Object.keys(val)
        i = keys.length
        while (i--) _traverse(val[keys[i]], seen)//取值的时候就已经触发getter
    }
}