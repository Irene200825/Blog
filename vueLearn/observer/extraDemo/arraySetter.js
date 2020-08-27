/**
 * 只有给数组重新赋值才会触发setter
 */

let val = [1, 2, 3, 4]
let object2 = {
    property1: 42,
    arr: val
};

Object.defineProperty(object2, 'arr', {
    enumerable: true,
    configurable: true,
    get: function () {
        console.log("get")
        return val
    },
    set: function (newVal) {
        console.log("set", newVal)
        val = newVal
    }
})

object2.arr[0] = 1 //get
object2.arr = [1, 2, 3] //set