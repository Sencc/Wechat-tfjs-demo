var fetchWechat = require('fetch-wechat');
var tf = require('@tensorflow/tfjs-core');
var webgl = require('@tensorflow/tfjs-backend-webgl');
var plugin = requirePlugin('tfjsPlugin');
//app.js
App({
  onLaunch: function () {
    plugin.configPlugin({
      // polyfill fetch function
      fetchFunc: fetchWechat.fetchFunc(),
      // inject tfjs runtime
      tf,
      // inject webgl backend
      webgl,
      // provide webgl canvas
      canvas: wx.createOffscreenCanvas()
    });

    this.globalData = {}

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight
        let custom = wx.getMenuButtonBoundingClientRect()
        let systemInfo = wx.getSystemInfoSync()
        this.globalData.Custom = custom
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight
        this.globalData.systemInfo = systemInfo
      }
    })

  }
  

});
