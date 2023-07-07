/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-06 10:08:58
 * @LastEditTime: 2023-06-06 20:03:02
 */


/**
 * @description: 计算一组数据的平均值
 * @param {*} numbers
 * @return {*}
 */
function average(numbers){
    if(numbers && numbers.length){
        const sum = numbers.reduce((pre, current) => pre + current, 0);

        return sum / (numbers.length);
    }else{
        return Infinity;
    }
}

/**
 * @description: 判断一个数列是否是单调递增的
 * @param {*} numbers
 * @return {*}
 */
function increment(numbers){
    return numbers.every((number, index) => index === 0 || number > numbers[index - 1]);
}

/**
 * @description: 判断一个数列是否是单调递增的
 * @param {*} numbers
 * @return {*}
 */
function decrease(numbers){
    return numbers.every((number, index) => index === 0 || number < numbers[index - 1]);
}
/**
 * @description: 计算一组数据的方差
 * @param {*} numbers
 * @return {*}
 */
function variance(numbers){
    const length = numbers.length;
    const averageNumber = average(numbers);

    const f2 = numbers.reduce((pre, current) => pre + Math.pow(current - averageNumber, 2), 0)

    return f2 / length;
}


export {
    increment,
    decrease,
    variance,
    average
}