const app = getApp()

Page({
  data: {
    userInfo: {},
    totalPunchInDays: 0,
    maxContinuousDays: 0,
    monthlyPunchInDays: 0,
    studyDuration: 2.0,
    wakeUpReminder: false
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.updateProfileData(app.globalData.userInfo)
    } else {
      app.userInfoReadyCallback = userInfo => {
        this.updateProfileData(userInfo)
      }
    }
  },

  updateProfileData(userInfo) {
    this.setData({
      userInfo: userInfo,
      totalPunchInDays: userInfo.totalPunchInDays || 0,
      maxContinuousDays: userInfo.maxContinuousDays || 0,
      monthlyPunchInDays: userInfo.monthlyPunchInDays || 0,
      studyDuration: userInfo.studyDuration || 2.0,
      wakeUpReminder: userInfo.wakeUpReminder || false
    })
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/profile_edit/profile_edit'
    })
  },

  handleDurationChange() {
    const durations = ['1.0', '1.5', '2.0', '2.5', '3.0']
    wx.showActionSheet({
      itemList: durations.map(d => d + ' 小时'),
      success: (res) => {
        const newDuration = parseFloat(durations[res.tapIndex])
        
        wx.showLoading({ title: '更新中...' })
        wx.cloud.callFunction({
          name: 'user_manager',
          data: {
            action: 'updateSettings',
            data: {
              studyDuration: newDuration,
              wakeUpReminder: this.data.wakeUpReminder
            }
          },
          success: () => {
            wx.hideLoading()
            this.setData({ studyDuration: newDuration })
            app.globalData.userInfo.studyDuration = newDuration
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '更新失败', icon: 'none' })
          }
        })
      }
    })
  },

  handleReminderChange(e) {
    const value = e.detail.value
    
    wx.showLoading({ title: '更新中...' })
    wx.cloud.callFunction({
      name: 'user_manager',
      data: {
        action: 'updateSettings',
        data: {
          studyDuration: this.data.studyDuration,
          wakeUpReminder: value
        }
      },
      success: () => {
        wx.hideLoading()
        this.setData({ wakeUpReminder: value })
        app.globalData.userInfo.wakeUpReminder = value
        if (value) {
          wx.showToast({ title: '已开启提醒', icon: 'success' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '更新失败', icon: 'none' })
      }
    })
  }
})