const regeneratorRuntime = require('regenerator-runtime')
const tf = require('@tensorflow/tfjs-core')
const tfl = require('@tensorflow/tfjs-layers')
const tfconv = require('@tensorflow/tfjs-converter')
import { getFrameSliceOptions } from '../../utils/util'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

const app=getApp()

Page({

  data: {
    result: "载入中...",
    showModal: false
  },

  async onReady() {

    //加载相机

    const camera = wx.createCameraContext(this)

    this.displaySize = {
      width: app.globalData.systemInfo.windowWidth,
      height: app.globalData.systemInfo.windowWidth
    }

    // 加载模型

    const net = await this.loadModel()

    // this.setData({
    //   result: 'Loading'
    // })

    let count = 0

    //每隔10帧获取一张相机捕捉到的图片

    const listener = camera.onCameraFrame((frame) => {

      count++

      if (count === 10) {

        if (net) {
          //对图片内容进行预测
          this.predict(net, frame)
        }
        count = 0

      }

    })

    listener.start()

  },

  //加载模型

  async loadModel() {
    const net = await cocoSsd.load('http://192.168.161.46:8080/miniso_logo/model.json')
    if (net) {
      this.setData({ result: '模型加载成功'})
      return net
      }

  },

  async predict(net, frame) {

    //图像预处理，API说明到tensorflow.google.cn查看

    const x = tf.tidy(() => {
      const temp = tf.browser.fromPixels({
        data: new Uint8Array(frame.data),
        width: frame.width,
        height: frame.height,
      }, 4)
      const sliceOptions = getFrameSliceOptions(this.cameraPosition, frame.width, frame.height, this.displaySize.width, this.displaySize.height)
      // const alignCorners = true
      // const pixels = temp.slice(sliceOptions.start, sliceOptions.size).resizeBilinear([224, 224],alignCorners)
      // const offset = tf.scalar(127.5);
      // const normalized = pixels.sub(offset).div(offset);
      // return normalized.reshape([-1, 224, 224, 3]);

      return temp.slice(sliceOptions.start, sliceOptions.size).resizeBilinear([this.displaySize.height, this.displaySize.width]).asType('int32')
    })
    // console.log(x)
    const res = await net.detect(x)

    //预测
    console.log(res)
    if (res[1] > 0.8) {
      this.setData({
        result: '检测到名创logo',
        showModal: true
      })}
    else {
      this.setData({
        result: '再周围移动看看'
      })
    }
  },
  preventTouchMove: function () {

  },

  closeMask: function () {
    this.setData({
      showModal: false
    })
  },

  ontTap: function () {
    wx.navigateTo({
      url: '../reward/reward',
    })
    this.setData({
      showModal: false
    })
  },

// **
//    * 点击取消
//   * /
  modalCandel: function () {
    // do something
    this.setData({
      showModal: false
    })
  },

  /**
   *  点击确认
   */
  modalConfirm: function () {
    // do something
    this.setData({
      showModal: false
    })

    wx.navigateTo({
      url: '../reward/reward',
    })
  }

})