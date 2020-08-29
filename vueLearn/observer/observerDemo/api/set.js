import { defineReactive } from ".."
import { isValidArrayIndex, hasOwn } from "../util"

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(target, key, val) {
  //target是否是数组,使用splice，数组拦截器会侦测到target的变化
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }

  //对象，如果key值已经存在，key值已经被侦测，直接改变值即可
  if (hasOwn(target, key)) {
    target[key] = val
    return val
  }

  const ob = target.__ob__
  //如果是根元素报错，this.$data就是根元素
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }

  //假如ob不存在，说明它不是响应式的，直接赋值就好
  if (!ob) {
    target[key] = val
    return val
  }

  //用户在响应式上新增一个属性，需要追踪变化
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}