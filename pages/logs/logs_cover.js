
const regeneratorRuntime = require('regenerator-runtime')
const tf = require('@tensorflow/tfjs-core')
const tfl = require('@tensorflow/tfjs-layers')
const tfconv = require('@tensorflow/tfjs-converter')


// 'http://172.18.253.61:8080//model.json'
// Page({
//   data: {
//     result: "载入中...",
//     _modelUrl: 'http://172.18.253.61:8080//model.json',
//   },
//   _model: null,
//   async onReady(options) {
//     const model = await blazeface.load({
//       modelUrl: this.data._modelUrl
//     });
//     this._model = model;
//     const context = wx.createCameraContext();
//     let count = 0;
//     const listener = context.onCameraFrame((frame) => {
//       count++;
//       if (count === 3) {
//         this.detectFace(frame);
//         count = 0;
//       }
//     });
//     listener.start();
//   },
//   async detectFace(frame) {
//     if (this._model) {

//       const image = {
//         data: new Uint8Array(frame.data),
//         width: frame.width,
//         height: frame.height
//       }
//       const res = await this._model.estimateFaces(image);
//       if (res.length >= 1) {
//         this.setData({
//           result: "检测到人脸"
//         })
//       } else {
//         this.setData({
//           result: "没有检测到人脸"
//         })
//       }
//     }
//   }
// }) 
Page({

  data: {
    result: "载入中...",
    showModal: false
  },

  async onReady() {

    //加载相机

    const camera = wx.createCameraContext(this)

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

    const net = await tfconv.loadGraphModel('http://192.168.161.46:8080//model.json')
    return net

  },

  async predict(net, frame) {

    //图像预处理，API说明和用发可到tensorflow.google.cn查看

    const imgData = {
      data: new Uint8Array(frame.data),
      width: frame.width,
      height: frame.height
    }

    const x = tf.tidy(() => {

      const imgTensor = tf.browser.fromPixels(imgData, 4)
      // console.log(imgTensor)

      // //转换为Tensor,微信小程序相机获取的图片有4维

      // const d = Math.floor((frame.height - frame.width) / 2)

      // const imgSlice = imgTensor.slice([d, 0, 0], [frame.width, -1, 3])

      // //截取正方形区域，并丢掉最后一个维度，只保留3个维度

      // const imgResize = tf.image.resizeBilinear(imgSlice, [224, 224])

      // // return imgResize.mean(2) //对最后一个维度去均值，将三通道转换为单通道
      // // return imgTensor
      // return imgResize

      // 从图片转为 tensor
      const img = tf.browser.fromPixels(imgData).toFloat();

      const offset = tf.scalar(127.5);
      // 把一张图片从 [0, 255] 归一化到 [-1, 1].
      const normalized = img.sub(offset).div(offset);

      // Resize the image to
      let resized = normalized;
      if (img.shape[0] !== 224 || img.shape[1] !== 224) {
        const alignCorners = true;
        resized = tf.image.resizeBilinear(
          normalized, [224, 224], alignCorners,
        );
      }

      // Reshape.
      const batched = resized.reshape([-1, 224, 224, 3]);
      return batched

    })

    // console.log(x)

    const res = await net.predict(x).squeeze().arraySync()

    //预测
    console.log(res)
    if (res[1] > 0.8) {
      this.setData({
        result: 'logo',
        showModal: true
      })
    }
    else {
      this.setData({
        result: 'no logo'
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