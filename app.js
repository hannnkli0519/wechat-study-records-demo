// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.login()
  },
  login() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        if (res.result.success) {
          this.globalData.userInfo = res.result.data
          // 如果页面已经加载，可以通过回调或事件通知更新
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res.result.data)
          }
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})