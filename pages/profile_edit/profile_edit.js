const app = getApp()

Page({
  data: {
    nickname: '',
    avatarUrl: ''
  },

  onLoad() {
    this.setData({
      nickname: app.globalData.userInfo.nickname,
      avatarUrl: app.globalData.userInfo.avatarUrl
    })
  },

  handleNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          avatarUrl: res.tempFilePaths[0]
        })
      }
    })
  },

  saveProfile() {
    if (!this.data.nickname.trim()) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...',
    })

    wx.cloud.callFunction({
      name: 'user_manager',
      data: {
        action: 'updateProfile',
        data: {
          nickname: this.data.nickname,
          avatarUrl: this.data.avatarUrl
        }
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          // 更新全局数据
          app.globalData.userInfo.nickname = this.data.nickname
          app.globalData.userInfo.avatarUrl = this.data.avatarUrl

          wx.showToast({
            title: '修改成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    })
  }
})