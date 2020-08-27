import { hasOwn } from "../util"

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target, key) {
    //target是否是数组,使用splice，数组拦截器会侦测到target的变化,并发送通知
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1)
      return
    }
    const ob = target.__ob__
    //如果是根元素报错，this.$data就是根元素
    if (target._isVue || (ob && ob.vmCount)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      )
      return
    }


    //如果删除的这个key在target中不存在，直接删除
    if (!hasOwn(target, key)) {
      return
    }

    //删除key
    delete target[key]

    //如果ob不存在，直接终止
    if (!ob) {
      return
    }

    //如果ob存在，发送通知
    ob.dep.notify()
  }