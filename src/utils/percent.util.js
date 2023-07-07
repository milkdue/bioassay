/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-05 15:00:09
 * @LastEditTime: 2023-06-06 11:58:46
 */
/**
* @ 占比计算
* @ number 当前数
* @ total 总数
*/
export function percent(number, total){
     number = parseFloat(number);
     total = parseFloat(total);

     if(isNaN(number) || isNaN(total)){
          return "-";
     }

     return total <= 0 ? 0 : (Math.round(number / total * 10000) / 100.00);
}

export function distance(x1, y1, x2, y2) {
     // 距离公式 ((x2 - x1)^2 + (y2 - y1)^2)^(1/2)
     return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
}