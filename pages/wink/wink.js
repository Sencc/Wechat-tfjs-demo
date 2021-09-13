// pages/wink/wink.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFilePaths: '',
    aimgurl: "", // //临时图片的路径
    countIndex: 1, // 可选图片剩余的数量
    imageData: [], // 所选上传的图片数据
    result: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  chooseimage: function(e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#CED63A",
      success: function(res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album');
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera');
          }
        }
      }
    })
  },

  chooseWxImage: function(type) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [type],
      success: function(res) {
        that.setData({
          result: null
        })
        var tempFilePaths = res.tempFiles[0]
        that.setData({
          tempFilePaths: tempFilePaths.path,
        });
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  detectWink: function() {
    let that = this;
    that.setData({
      result: null
    })
    // loading
    wx.showLoading({
      title: '分析中...'
    })

    // 将图片上传
    wx.uploadFile({
      url: 'http://10.230.196.10:11111/invoice-eye',
      name: 'file',
      filePath: that.data.tempFilePaths,
      success(res) {
        // 解析 JSON
        const result = JSON.parse(res.data)
        if (result.result >= 0) {
          // 成功获取分析结果
          that.setData({
            result: result.result
          })
        } else {
          // 检测失败
          wx.showToast({
            icon: 'none',
            title: '找不到你的眼睛喽～'
          })
        }

        // end loading
        wx.hideLoading()
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})