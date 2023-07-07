/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-06 11:01:34
 * @LastEditTime: 2023-06-06 11:01:57
 */
export function delay(m = 1) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, m * 1000);
    })
}