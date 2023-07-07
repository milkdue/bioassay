<!--
 * @Author: 可以清心
 * @Description: 
 * @Date: 2023-06-04 14:34:29
 * @LastEditTime: 2023-06-12 12:23:56
-->
<template>
    <div class="apaas-custom-media">
        <van-notice-bar
            color="#1989fa" 
            background="#ecf9ff"
            :scrollable="false"
        >
            <van-swipe
                ref="actionSwipe"
                vertical
                class="notice-swipe"
                :show-indicators="false"
                :touchable="false"
                :key="swipeKey"
            >
                <van-swipe-item v-for="(item, index) in currentAction" :key="index">{{item.name}}</van-swipe-item>
            </van-swipe>
        </van-notice-bar>
        <div class="camera-wrapper" :style="cameraStyle">
            <div class="canvas-wrapper" :style="canvasStyle">
                <video
                    ref="video"
                    :width="width"
                    :height="height"
                    webkit-playsinline="true"
                    playsinline="true"
                    preload
                    autoplay
                    loop
                    muted
                ></video>
                <canvas
                    ref="canvas"
                    :width="width"
                    :height="height"
                ></canvas>
                <img v-if="showImg" :src="imgUrl" :width="width" :height="height"/>
            </div>
            <van-circle
                v-model="rate"
                :style="cameraStyle"
                :rate="0"
                :speed="100"
                :stroke-width="20"
                layer-color="#ebedf0"
            ></van-circle>
        </div>

        <div class="camera-toggle" title="切换摄像头" @click="action = true">
        </div>

        <van-action-sheet
            v-model="action"
            :actions="deviceList"
            description="请选择设备"
            @select="actionSelect"
            cancel-text="取消"
            close-on-click-action
        >
        </van-action-sheet>

        <div class="btn-operate">
            <van-button
                v-if="cameraing && !recording"
                @click="startMediaRecorder"
                type="info"
                native-type="button"
            >开始录制</van-button>
            <van-button
                v-if="cameraing && recording"
                type="danger"
                native-type="button"
                disabled
            >录制中</van-button>
            <van-button
                @click="reMediaRecord"
                v-if="!cameraing && !recording"
                type="default"
                native-type="button"
            >重新录制</van-button>
        </div>

        <div class="prompt-text">
            <h5>检测说明</h5>
            <ol>
                <li>请使用前置摄像头</li>
                <li>脸部距离屏幕应该控制</li>
                <li>保证光线充足、脸部完全入镜、脸部无遮挡物</li>
                <li>开始录制后请按照提示做出相应动作</li>
                <li>如录制不满意可点击“重新录制”。</li>
            </ol>
        </div>
    </div>
</template>

<script>
    import {userMedia} from './utils/user-media.util';
    import tfMixin from './mixins/tf.mixin';
    import mediaMixin from './mixins/media.mixin';
    export default {
        name: "App",
        mixins: [tfMixin, mediaMixin],
        data() {
            return {
                width: 280,
                height: 280,
                action: false,
                rate: 0, // 检测进度
                showImg: false,
                imgUrl: '',
                swipeKey: new Date().getTime()
            }
        },
        computed: {
            canvasStyle(){
                const {width, height} = this;

                return {
                    width: width + 'px',
                    height: height + 'px'
                }
            },
            cameraStyle(){
                const {width, height} = this;

                return {
                    width: width + 7 + 'px',
                    height: height + 7 + 'px'
                }
            }
        },
        mounted(){
            const size = (document.documentElement.clientWidth || window.innerWidth) * 0.6;
            
            if(size < 280){
                this.width = size;
                this.height = size;
            }

            userMedia(); // 兼容代码
            this.getUserMedia();
        }
    }
</script>

<style>
    @import "./assets/scss/media-camera.less";
</style>
