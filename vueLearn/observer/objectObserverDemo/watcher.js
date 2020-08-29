import { pushTarget, popTarget } from "./dep.js"

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
    constructor(vm, expOrFn, cb) {

        this.deps = []
        this.depIds = new Set()

        this.vm = vm
        this.getter = parsePath(expOrFn)
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
            popTarget()//清除Dep.target的值
        }
        return value

    }

    addDep(dep) {
        const id = dep.id
        //如果没有订阅，才能存储
        if (!this.depIds.has(id)) {
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }


    update(){
        const oldValue = this.value//原来的值
        this.value = this.get()//新的值
        this.cb.call(this.vm,this.value,oldValue)
    }
}