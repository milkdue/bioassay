/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-04 15:37:48
 * @LastEditTime: 2023-06-05 15:00:19
 */
export function isEmpty(value){
    return (
        value === undefined ||
        value === "" ||
        value === null ||
        value === 0 ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
}