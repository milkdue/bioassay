
/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-04 14:50:43
 * @LastEditTime: 2023-06-04 15:00:12
 */
export function userMedia(){
    window.URL = (window.URL || window.webkitURL || window.mozURL || window.msURL);

    if(navigator.mediaDevices === undefined){
        navigator.mediaDevices = {};
    }

    if(navigator.mediaDevices.getUserMedia === undefined){
        navigator.mediaDevices.getUserMedia = constraints => {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

            if(!getUserMedia){
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }
}