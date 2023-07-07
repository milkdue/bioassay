/*
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-04 15:01:46
 * @LastEditTime: 2023-06-07 09:57:19
 */
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import {isEmpty} from '../utils/empty.util';
import {percent, distance} from '../utils/percent.util';
import {increment, decrease, variance} from '../utils/number.util';
import {delay} from '../utils/process.util';
import {drawFeaturePoint} from '../utils/canvas.util';
export default {
    data(){
        return {
            modelLoading: false, // 模型是否正在加载中
            detector: null, // 探测器
            requestAnimationFrameId: null,
            isEmpty,
            actionIndex: 0, // 当前动作索引
            currentAction: [],
            faceNullFrequency: 0, // faces为空数组的频率，意味着没有人脸的频率
            // faceList: [], // 符合要求的面部数组
            farAndNearProportionList: [], // 人脸远近比例的数组
            openMouthProportionList: [], // 张嘴比例
            winkProportionList: [], // 眨眼
            shakingHeadProportionList: [], // 摇头
            centerPointX: [], // 中心点的关键点 存储100个
            centerPointY: [], // 中心点的关键点 存储100个
            centerPointZ: [], // 中心点的关键点 存储100个
        }
    },
    methods: {
        async createDetector(){
            return new Promise(async (resolve, reject) => {
                // 生成检测动作
                this.generateAction();
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示toast
                    forbidClick: true, // 禁用点击背景
                    message: "加载模型中(首次加载需要1-2分钟)"
                });
                this.modelLoading = true;

                try {
                    if(!isEmpty(this.detector)){
                        this.detector.dispose();
                    }

                    if(!isEmpty(this.requestAnimationFrameId)){
                        window.cancelAnimationFrame(this.requestAnimationFrameId);
                        this.requestAnimationFrameId = null;
                    }

                    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                    const detectorConfig = {
                        maxFaces: 1, // 检测到的最大面部数量
                        refineLandmarks: true, // 可以完善眼睛和嘴唇周围的地标坐标，并在虹膜周围输出其他地标
                        runtime: 'mediapipe',
                        solutionPath: './face_mesh',
                        // solutionPath: 'https://unpkg.com/@mediapipe/face_mesh',
                    };

                    this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);

                    this.requestAnimationFrameId = window.requestAnimationFrame(this.renderPrediction);
                    console.log("模型加载成功！")
                    resolve("加载成功!");
                } catch (error) {
                    this.modelLoading = false;
                    this.detector = null;

                    console.error("加载失败: ", error);
                    // 重新加载
                    reject(error);
                } finally {
                    toast.clear();
                }
            })
        },
        generateAction(){
            this.currentAction = this.getCheckAction().map(action => {
                action.complete = false;
                action.time = 0;

                return action;
            })
        },
        getCheckAction(){
            return [
                {
                    name: "开始",
                    value: 0,
                    action: 'start',
                },
                {
                    name: "远一些",
                    value: 1,
                    action: 'far',
                },
                {
                    name: "近一些",
                    value: 2,
                    action: 'near'
                },
                {
                    name: "张嘴",
                    value: 3,
                    action: 'mouth'
                },
                {
                    name: "眨眼",
                    value: 4,
                    action: 'eye'
                },
                {
                    name: "向左转头",
                    value: 5,
                    action: 'left-head'
                },
                {
                    name: "向右转头",
                    value: 6,
                    action: 'right-head'
                },
                {
                    name: "完成",
                    action: 'complete'
                }
            ]
        },
        // 预测动作
        async renderPrediction(){
            let video = this.$refs.video;
            let canvas = this.$refs.canvas;
            let context = canvas.getContext('2d');

            if(this.detector && this.cameraing){
                try {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    const faces = await this.detector.estimateFaces(video, {
                        flipHorizontal: false, // 没有镜像
                    })

                    // console.log(faces, 'faces');

                    this.modelLoading = false;


                    if(faces.length > 0){
                        this.faceNullFrequency = 0; // faces为空数据的频率
                        this.drawResults(faces, context);
                    }else{
                        this.faceNullFrequency++; // 频率++

                        if(this.faceNullFrequency >= 5){
                            // 如果连续5帧没有检测到人脸提示
                            this.$toast("没有检测到人脸");
                        }
                        
                        // todo 如果5帧内没有检测到人脸，就将所有比例数组全部清空
                    }
                } catch (error) {
                    this.createDetector(); // 重新生成侦听器
                    this.modelLoading = false;

                    // this.$toast(error.message);
                    console.error(error, 'error');
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }

                this.requestAnimationFrameId = window.requestAnimationFrame(this.renderPrediction);
            }else{
                context.clearRect(0, 0, canvas.width, canvas.height);
                this.requestAnimationFrameId = window.requestAnimationFrame(this.renderPrediction);
            }
        },
        // 绘制显示结果
        drawResults(faces, ctx) {
            // 每一个face都会有478个脸部模型的特征点
            faces.forEach(face => {
                ctx.fillStyle = '#1af117';

                (face.keypoints || []).forEach(point => {
                    ctx.beginPath();
                    // 绘制圆弧 半径1 弧度 2π
                    ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
                    ctx.fill();
                });

                drawFeaturePoint(face, ctx);

                const faceProportion = percent(face.box.width * face.box.height, this.width * this.height);

                // 展示当前距离比率
                // this.$refs['faceProportion'].innerHTML = `10-50之间,当前距离:<b>${Math.round(faceProportion)}</b>`;

                if(faceProportion <= 10){ // 占比 小于10 则太远
                    this.$toast("距离太远!");
                    // todo 太远 太近也需要清空比例数组
                    return;
                }

                if(faceProportion >= 50){ // 占比 大于50 则太近
                    this.$toast("距离太近!");
                    // todo 太远 太近也需要清空比例数组
                    return;
                }

                if(face.keypoints && face.keypoints.length){
                    this.centerPointX.push(face.keypoints[195].x);
                    this.centerPointY.push(face.keypoints[195].y);
                    this.centerPointZ.push(face.keypoints[195].z);

                    if(this.centerPointX.length > 100){
                        // 剔除首个
                        this.centerPointX.shift();
                    }

                    if(this.centerPointY.length > 100){
                        this.centerPointY.shift();
                    }
                }

                // 距离刚好则进行校验，前提是已经开始录制并且相机已打开
                if(this.recording && this.cameraing){
                    let current = this.currentAction[this.actionIndex];

                    if(current.action === 'start'){
                        return;
                    }else if(this.centerPointX.length >= 100){
                        console.log('x', variance(this.centerPointX));
                        console.log('y', variance(this.centerPointY));
                        console.log('z', variance(this.centerPointZ))
                        if(current.action === 'far' || current.action === 'near'){
                            this.isFarAndNear(face, current.action);
                            return;
                        }

                        if(current.action === "mouth"){
                            this.isOpenMouth(face, ctx);
                            return;
                        }

                        if(current.action === 'eye'){
                            this.isWink(face, ctx);
                            return;
                        }

                        if(current.action === 'left-head' || current.action === 'right-head'){
                            this.isShakingHisHead(face, ctx, current.action);
                        }

                        if(current.action === 'complete'){
                            this.triggerAction();
                        }
                    }else{
                        this.$toast('方差数据还未准备完成');
                    }
                }
            });

            
            // faces.forEach(faceItem => {
            //   ctx.fillStyle = '#1af117';
            //   (faceItem.keypoints || []).forEach((element, index) => {
            //     /* arc */
            //     ctx.beginPath();
            //     // 绘制圆弧 半径1 弧度2pi
            //     ctx.arc(element.x, element.y, 1, 0, 2 * Math.PI);
            //     ctx.fill();
            //     /* arc */
            //   });
            //   // 人脸图像的宽高比和视频输出的宽高比
            //   const faceProportion = this.GetPercent(faceItem.box.width * faceItem.box.height, this.width * this.height);
            //   this.$refs['faceProportion'].innerHTML = `10-50之间,当前距离:<b>${Math.round(faceProportion)}</b>`;
      
            //   if (faceProportion <= 10) { // 占比 小于10 则太远
            //     Toast(`距离太远`);
            //     return;
            //   };
            //   if (faceProportion >= 50) { // 占比 大于50 则太近
            //     Toast(`距离太近`);
            //     return;
            //   };
            //   if (this.isCameraOpen && this.inProgress) {
            //     //靠近&远离
            //     this.isFarAndNear(faceItem);
      
            //     //张嘴
            //     this.isOpenMouth(faceItem, ctx);
      
            //     //眨眼
            //     this.isWink(faceItem, ctx);
      
            //     //摇头
            //     this.isShakingHisHead(faceItem, ctx);
            //   }
            // });
        },

        // 远离和靠近
        isFarAndNear(face, type){
            const proportion = percent(face.box.width * face.box.height, this.width * this.height);
            this.farAndNearProportionList.push(proportion);

            // 记录四帧的动态变化
            if(this.farAndNearProportionList.length > 4){
                this.farAndNearProportionList.shift();

                const length = this.farAndNearProportionList.length;
                const first = this.farAndNearProportionList[0];
                const last = this.farAndNearProportionList[length - 1];

                // 计算 相对偏差 (a - (a + b) / 2) / ((a + b) / 2)
                const diff = Math.abs(percent(first - last, first + last));

                if(type === 'near'){
                    // 靠近
                    if(increment(this.farAndNearProportionList)){
                        // 保证比例单调递增为靠近
                        if(diff >= 5){
                            // 这个比例的相对偏差大于 5% 校验成功
                            this.triggerAction();
                        }
                    }
                }

                if(type === 'far'){
                    // 远离
                    if(decrease(this.farAndNearProportionList)){
                        // 保证比例单调递减为远离
                        if(diff >= 5){
                            // 这个比例的相对偏差大于 5% 校验成功
                            this.triggerAction();
                        }
                    }
                }
            }
        },
        isOpenMouth(face, ctx){
            const featurePointIndex1 = [0, 17]; // 17和0是上下嘴唇的特征点
            const featurePointLocation1 = [];
            const featurePointIndex2 = [10, 152]; // 152和10是上下脸的特征点
            const featurePointLocation2 = [];

            (face.keypoints || []).forEach((point, index) => {
                if(featurePointIndex1.includes(index)){
                    if(featurePointLocation1.length === 0){
                        ctx.moveTo(point.x, point.y);
                    }else{
                        ctx.lineTo(point.x, point.y);
                    }
                    featurePointLocation1.push([point.x, point.y]);
                }

                if(featurePointIndex2.includes(index)){
                    featurePointLocation2.push([point.x, point.y]);
                }
            })

            ctx.strokeStyle = 'red';
            ctx.stroke();

            const proportion = percent(
                distance(
                    featurePointLocation1[0][0],
                    featurePointLocation1[0][1],
                    featurePointLocation1[1][0],
                    featurePointLocation1[1][1]
                ),
                distance(
                    featurePointLocation2[0][0],
                    featurePointLocation2[0][1],
                    featurePointLocation2[1][0],
                    featurePointLocation2[1][1]
                )
            );

            this.openMouthProportionList.push(proportion);
            
            // 取两帧的动态变化
            if(this.openMouthProportionList.length > 2){
                this.openMouthProportionList.shift();
                // 只有递增的时候才是张嘴的时候
                if(increment(this.openMouthProportionList)){
                    const length = this.openMouthProportionList.length;
                    const first = this.openMouthProportionList[0];
                    const last = this.openMouthProportionList[length - 1];
                    const diff = Math.abs(percent(first - last, first + last));

                    // 相对偏差大于5%表示检验成功
                    // 方差代表着这组数据的稳定性
                    // 中心点的方差小于 5^2 
                    if(diff >= 5 && variance(this.centerPointX) <= 25 && variance(this.centerPointY) <= 25 && variance(this.centerPointZ)){
                        this.triggerAction();
                    }

                    // if(diff >= 5){
                    //     this.triggerAction();
                    // }
                }
            }
        },
        isWink(face, ctx){
            const rightEye = [159, 144]; // 右眼的特征点
            const rightEyeLocation = [];
            const leftEye = [385, 374]; // 左眼的特征点
            const leftEyeLocation = [];

            (face.keypoints || []).forEach((point, index) => {
                if(rightEye.includes(index)){
                    if(rightEyeLocation.length === 0){
                        ctx.moveTo(point.x, point.y);
                    }else{
                        ctx.lineTo(point.x, point.y);
                    }

                    rightEyeLocation.push([point.x, point.y]);
                }

                if(leftEye.includes(index)){
                    leftEyeLocation.push([point.x, point.y]);
                }
            });


            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();

            let rightEyeProportion = distance(
                rightEyeLocation[0][0],
                rightEyeLocation[0][1],
                rightEyeLocation[1][0],
                rightEyeLocation[1][1]
            );

            let leftEyeProportion = distance(
                leftEyeLocation[0][0],
                leftEyeLocation[0][1],
                leftEyeLocation[1][0],
                leftEyeLocation[1][1]
            );

            if(rightEyeProportion <= 5 || leftEyeProportion <= 5){
                this.winkProportionList.push([rightEyeProportion, leftEyeProportion]);

                if(this.winkProportionList.length >= 4){
                    // 连续4帧
                    this.triggerAction();
                    this.winkProportionList = []; // 成功后清空
                }
            }else{
                // 清空符合条件的帧数
                this.winkProportionList = [];
            }
        },
        isShakingHisHead(face, ctx, type){
            console.log('isshakingH')
            const leftFace = [195, 323];
            const leftFaceLocation = [];
            const rightFace = [195, 93];
            const rightFaceLocation = [];

            (face.keypoints || []).forEach((point, index) => {
                if(leftFace.includes(index)){
                    leftFaceLocation.push([point.x, point.y]);
                }

                if(rightFace.includes(index)){
                    if(rightFaceLocation.length === 0){
                        ctx.beginPath();
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 2;
                        ctx.moveTo(point.x, point.y);
                    }else{
                        ctx.lineTo(point.x, point.y);
                        ctx.stroke()
                    }

                    rightFaceLocation.push([point.x, point.y]);
                }
            });

            let leftProportion = distance(
                leftFaceLocation[0][0],
                leftFaceLocation[0][1],
                leftFaceLocation[1][0],
                leftFaceLocation[1][1]
            );

            let rightProportion = distance(
                rightFaceLocation[0][0],
                rightFaceLocation[0][1],
                rightFaceLocation[1][0],
                rightFaceLocation[1][1]
            );

            console.log(leftProportion, 'left'); // 左转判断 right > 90即可
            console.log(rightProportion, 'ri    '); // 右转判断 left > 90 即可

            // const diff = percent(leftProportion - rightProportion, leftProportion + rightProportion);
            // console.log(diff, 'diff');
            // this.shakingHeadProportionList.push(diff);

            this.shakingHeadProportionList.push({left: leftProportion, right: rightProportion})

            if(this.shakingHeadProportionList.length > 4){
                console.log(this.shakingHeadProportionList)
                this.shakingHeadProportionList.shift();

                if(type === 'left-head'){
                    
                    const isL = this.shakingHeadProportionList.every(e => e.right >= 90);

                    if(isL){
                        this.triggerAction();
                    }
                }

                if(type === 'right-head'){
                    const isR = this.shakingHeadProportionList.every(e => e.left >= 90);

                    if(isR){
                        this.triggerAction();
                    }
                }
            }
        },
        // 触发动作
        triggerAction(){
            const {cameraing, recording, actionIndex, currentAction} = this;
            if(cameraing && recording){
                currentAction[actionIndex].complete = true;
                this.actionIndex++;
                // 检测进度 默认的开始和完成不计入检测范畴
                this.rate = percent(currentAction.filter(e => e.complete && e.action !== 'complete').length - 1, currentAction.length - 2);
                
                

                let complete = currentAction.every(e => e.complete === true);
                if(complete){
                    this.stopMediaRecorder();
                }else{
                    this.$refs.actionSwipe.next();
                }
            }
        },
        async stopMediaRecorder(){
            this.cameraing = false;
            this.recording = false;

            const toast = this.$toast.loading({
                duration: 0,
                forbidClick: true,
                message: "已完成!保存视频中"
            });

            await delay(5);

            // https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStream
            this.mediaStream.getVideoTracks().forEach(track => {
                // 所有视频轨道停止跟踪
                track.stop();
            });
            // https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack/stop
            this.mediaRecorder && this.mediaRecorder.stop();

            toast.clear();
        }
    }
}