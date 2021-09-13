import * as handpose from "@tensorflow-models/handpose"
import * as tf from "@tensorflow/tfjs-core"
import {
  getFrameSliceOptions
} from '../../utils/util'
const app = getApp()
// pages/hand/hand.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: "载入中..."
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

          const query = wx.createSelectorQuery()
          query.select('#hand')
            .fields({
              node: true,
              size: true
            })
            .exec((res) => {
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              const dpr = wx.getSystemInfoSync().pixelRatio
              canvas.width = this.displaySize.width
              canvas.height = this.displaySize.height
              ctx.clearRect(0, 0, this.displaySize.width, this.displaySize.height);
              ctx.strokeStyle = 'green';
              ctx.lineWidth = 3;
              ctx.fillStyle = 'red';
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              //对图片内容进行预测
              this.predict(net, frame, ctx)
            })
        }
        count = 0
      }
    })
    listener.start()
  },
  async loadModel() {
    // tf.setBackend("webgl");
    const model = await handpose.load();
    console.log(model)
    if (model) {
      this.setData({
        result: '模型加载成功'
      })
      return model
    }
  },

  async predict(net, frame, ctx) {
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
    // const res = await net.detect(x)
    const predictions = await net.estimateHands(x, true);
    x.dispose();

    //预测
    if (predictions.length > 0) {
      const result = predictions[0].landmarks;
      this.drawKeypoints(ctx, result);
    }
  },

  drawKeypoints(ctx, keypoints) {
    // const p = points;
    // ctx.strokeStyle = 'red'
    // for (let i = 0; i < 5; i++) {
    //   this.drawline(ctx, [p[4 * i + 1], p[4 * i + 2], p[4 * i + 3], p[4 * i + 4]], false);
    // }
    // ctx.strokeStyle = 'green'
    // this.drawline(ctx, [p[0], p[1], p[5], p[9], p[13], p[17]], true);

    // for (let i = 0; i < p.length; i++) {
    //   const y = p[i][0];
    //   const x = p[i][1];

    //   ctx.beginPath();
    //   ctx.arc(y, x, 5, 0, 2 * Math.PI);
    //   ctx.fill();
    // }
    const keypointsArray = keypoints;
    // console.log(keypointsArray.length);
    for (let i = 0; i < keypointsArray.length; i++) {
      const y = keypointsArray[i][0];
      const x = keypointsArray[i][1];
      this.drawPoint(ctx, x, y, 3);
    }
    const y4 = keypointsArray[4][0];
    const x4 = keypointsArray[4][1];
    const y8 = keypointsArray[8][0];
    const x8 = keypointsArray[8][1];
    const o = this.getDistanceBetweenTwoPoints(x4, y4, x8, y8)
    console.log(o)
    if(o<=30){
      this.setData({
        result:"OKR"
      })
    }else{
      this.setData({
        result: "换个手势吧"
      })
    }
    const fingerLookupIndices = {
      thumb: [0, 1, 2, 3, 4],
      indexFinger: [0, 5, 6, 7, 8],
      middleFinger: [0, 9, 10, 11, 12],
      ringFinger: [0, 13, 14, 15, 16],
      pinky: [0, 17, 18, 19, 20]
    }
    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
      this.drawPath(ctx, points, false);
    }
  },

  drawPath(ctx, points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point[0], point[1]);
    }
    if (closePath) {
      region.closePath();
    }
    ctx.stroke(region);
  },

  drawPoint(ctx, y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  },

  drawline(ctx, points, close) {
    const line = new Path2D();

    line.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      line.lineTo(point[0], point[1]);
    }
    if (close) {
      line.closePath();
    }
    ctx.stroke(line);
  },
  getDistanceBetweenTwoPoints(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var result = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    return result;
  }

})