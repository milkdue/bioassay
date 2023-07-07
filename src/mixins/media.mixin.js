/*
 * @Author: 可以清心
 * @Description: 媒体
 * @Date: 2023-06-04 15:02:54
 * @LastEditTime: 2023-06-07 11:41:29
 */
import {isEmpty} from '../utils/empty.util'
export default {
    data(){
        return {
            recording: false, // 是否正在录制
            cameraing: false, // 相机是否正在打开中
            blob: null, // 录制文件存储流
            deviceList: [], // 设备列表
            deviceId: 0, // 设备id
            mediaStream: null, // 媒体流 视频流
            mediaRecorder: null, // 指定媒体流进行录制实例
        }
    },
    methods: {
        async openUserMedia() {
            const mediaStatus = await this.getUserMedia();

            if(mediaStatus.code === 'ok'){
                // 加载模型 tf.mixin
                this.createDetector();
                this.$toast("相机已打开!");
            }else{
                this.$dialog.alert({
                    title: "失败",
                    message: `打开相机失败: ${mediaStatus.message}`,
                    theme: 'round-button'
                }).then(() => {
                    location.replace(`${location.pathname}?s=${new Date().getTime()}`)
                })
            }
        },
        getUserMedia() {
            return new Promise(resolve => {
                this.recording = false; // 录制暂停
                this.cameraing = false; // 相机关闭中
                this.blob = null; // 录制所存在流

                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true, // 禁止点击背景
                    message: "打开摄像头"
                });

                const {width, height, deviceId} = this;

                // https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
                let mediaOptions = {
                    audio: false, // 丢弃音频媒体
                    video: true, // 视频媒体
                    video: {
                        width,
                        height,
                        frameRate: { // 帧率 使用最佳帧率
                            ideal: 100,
                            max: 150
                        }
                    }
                }

                if(isEmpty(deviceId)){ // 相机设备id为空时使用前置摄像头 否则使用指定的设备
                    mediaOptions.video.facingMode = "user"; // 使用前置摄像头 environment 后置摄像头
                }else{
                    mediaOptions.video.deviceId = deviceId;
                }

                // 获取视频流
                this.getMediaStream(mediaOptions, toast, resolve);
            })
        },
        async getMediaStream(options, toast, resolve){
            try {
                const {getDeviceList} = this;
                const stream = await navigator.mediaDevices.getUserMedia(options);
                this.mediaStream = stream;

                // 获取设备列表
                this.deviceList = await getDeviceList() || [];

                const video = this.$refs.video;

                // 暂停
                video.pause();
                // 兼容ios微信浏览器小窗口播放
                video.setAttribute("playsinline", true);
                // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement/srcObject
                if("srcObject" in video){
                    video.srcObject = stream;
                }else{
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                }
                // 播放
                video.play();

                video.onplay = () => {
                    toast.clear();
                    this.cameraing = true; // 相机已经在打开中
                    resolve({code: "ok"})
                }
            } catch (error) {
                toast.clear();
                console.error(error, "获取媒体流失败");
                resolve({
                    code: "error",
                    message: error.message,
                    error
                })
            }
        },
        getDeviceList(){
            return new Promise(async resolve => {
                const toast = this.$toast.loading({
                    duration: 0,
                    forbidClick: true,
                    message: "获取设备中..."
                });

                try {
                    const {deviceId} = this;
                    const devices = await navigator.mediaDevices.enumerateDevices();

                    let deviceList = [];

                    (devices || []).forEach(device => {
                        device.name = device.label || device.deviceId;

                        if(device.kind === 'videoinput' && device.deviceId){
                            device.color = device.deviceId === deviceId ? '#1989fa' : '#323233';

                            deviceList.push(device);
                        }
                    });
                    console.log(deviceList, '获取设备成功');
                    resolve(deviceList);
                } catch (error) {
                    console.error(error, '获取设备失败');
                } finally {
                    toast.clear();
                }
            })
        },
        actionSelect({deviceId}) {
            this.action = false;
            if (!isEmpty(deviceId) && this.deviceId !== deviceId) {
                this.deviceId = deviceId;
                this.openUserMedia();
            }
        },
        // 开始录制
        startMediaRecorder(){
            return new Promise(async (resolve, reject) => {
                if(typeof MediaRecorder === 'function'){
                    this.farAndNearProportionList = []; // 记录远近
                    this.openMouthProportionList = []; // 张嘴
                    this.winkProportionList = []; // 眨眼
                    this.shakingHeadProportionList = []; // 摇头
                    this.recording = false; // 录制还未开始

                    const toast = this.$toast.loading({
                        duration: 0,
                        forbidClick: true,
                        message: "准备录制"
                    });

                    const mediaRecorder = new MediaRecorder(this.mediaStream, {
                        audioBitsPerSecond: 0, // 音频码率
                        videoBitsPerSecond: 1000000 * 20, // 视频码率 数值越大视频越清晰
                        // mimeType: 'video/webm;codecs=h264', // 视频编码 h.264
                    });

                    this.mediaRecorder = mediaRecorder;

                    mediaRecorder.start();

                    mediaRecorder.ondataavailable = e => {
                        this.blob = new Blob([e.data], {
                            type: e.currentTarget.mimeType
                        })
                    }

                    mediaRecorder.onerror = e => {
                        this.recording = false;
                        console.error(e);
                        toast.clear();

                        reject({error: e});
                    }

                    mediaRecorder.onstart = e => {
                        this.recording = true;
                        console.info("开始录制了:", e);
                        toast.clear();
                        this.$toast("开始录制");

                        this.triggerAction(); // 开始检测了
                        resolve({code: 'ok'});
                    }

                    mediaRecorder.onresume = e => {
                        this.recording = true;
                        console.info("恢复录制了", e);
                        toast.clear();

                        resolve({code: 'ok'})
                    }

                    mediaRecorder.onstop = e => {
                        this.recording = false;

                        const saveFile = this.$toast.loading({
                            duration: 0,
                            forbidClick: true,
                            message: "保存视频中"
                        });
                        
                        console.info("结束", e);
                        console.log(this.blob, 'blob')

                        const url = window.URL && window.URL.createObjectURL(this.blob);

                        this.$dialog.confirm({
                            title: "录制完成",
                            message: `
                                <video src="${url}#t=0.01" style="display: block;width: 100%;" webkit-playsinline="true" playsinline="true" controls autoplay></video>
                                <div class="van-cell van-cell--center">
                                    <div class="van-cell__title" style="text-align: left;">
                                        <span>文件大小</span>
                                    </div>
                                    <div class="van-cell__value">
                                        <span>${(this.blob.size / 1024).toFixed(2)}kb</span>
                                    </div>
                                </div>
                            `,
                            theme: 'round-button',
                            className: 'videoDialog',
                            confirmButtonText: '上传'
                        }).then(() => {
                            this.$toast("上传成功");
                        }).catch(() => {
                            const that = this;
                            const {width, height} = this;
                            let canvas = this.$refs.canvas;
                            let context = canvas.getContext('2d');
                            let video = document.createElement("video");
                            video.setAttribute('src', url);
                            video.setAttribute('width', width);
                            video.setAttribute('height', height);
                            video.setAttribute('preload', 'auto');

                            video.addEventListener('loadeddata', function () {
                                console.log("我的URL");
                                const img = new Image(width, height);
                                img.src = "https://bu.dusays.com/2021/06/08/12c39372b914a.jpeg";
                                context.drawImage(video, 0, 0, width, height); //绘制canvas

                                

                                // let imgNode = document.createElement('img');
                                // imgNode.width = width;
                                // imgNode.height = height;
                                
                                const dataURL = canvas.toDataURL('image/jpeg'); //转换为base64

                                that.showImg = true;
                                that.imgUrl = dataURL

                                that.showImg = true;

                                // imgNode.src = dataURL;
                                console.log(dataURL);
                                
                                // document.body.appendChild(imgNode)
                            });
                        })

                        saveFile.clear();
                    }
                }
            })
        },
        // 重新录制
        async reMediaRecord(){
            this.swipeKey = new Date().getTime(); // 重新渲染
            this.actionIndex = 0; // 清空
            this.showImg = false;
            this.imgUrl = "";
            this.generateAction();
            this.openUserMedia();
            await this.startMediaRecorder();
        }
    }
}