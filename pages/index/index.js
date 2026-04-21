const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    navHeight: 44,
    statusBarHeight: 20,
    fullDate: '',
    punchInDays: 0,
    isPunched: false,
    content: '',
    quotes: [
      { text: '“学习是一场马拉松，不在于瞬间的爆发，而在于途中的坚持。每一天的微小努力，都在为未来的蜕变蓄力。”', author: '2026 坚持的力量' },
      { text: '“种一棵树最好的时间是十年前，其次是现在。”', author: '大卫·艾伦' },
      { text: '“不积跬步，无以至千里；不积小流，无以成江海。”', author: '荀子' },
      { text: '“你现在的努力，是为了以后有更多的选择。”', author: '佚名' }
    ],
    currentQuote: {},
    images: []
  },

  onLoad() {
    this.calculateNavHeight()
    this.setData({
      fullDate: util.getFullDate(new Date()),
      currentQuote: this.data.quotes[Math.floor(Math.random() * this.data.quotes.length)]
    })
    
    if (app.globalData.userInfo) {
      this.setData({
        punchInDays: app.globalData.userInfo.totalPunchInDays
      })
    } else {
      app.userInfoReadyCallback = userInfo => {
        this.setData({
          punchInDays: userInfo.totalPunchInDays
        })
      }
    }
  },

  calculateNavHeight() {
    wx.getSystemInfo({
      success: (res) => {
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
        const statusBarHeight = res.statusBarHeight
        const navHeight = menuButtonInfo.height + (menuButtonInfo.top - statusBarHeight) * 2
        this.setData({
          statusBarHeight,
          navHeight
        })
      }
    })
  },

  handlePunchIn() {
    if (this.data.isPunched) return
    
    wx.showLoading({ title: '打卡中...' })
    
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    wx.cloud.callFunction({
      name: 'punch_manager',
      data: {
        action: 'addPunch',
        data: {
          content: this.data.content,
          images: this.data.images,
          dateStr,
          timeStr
        }
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          wx.vibrateShort()
          this.setData({
            isPunched: true,
            punchInDays: this.data.punchInDays + 1
          })
          // 更新全局数据
          app.globalData.userInfo.totalPunchInDays += 1
          
          wx.showToast({
            title: '打卡成功',
            icon: 'success'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '打卡失败', icon: 'none' })
      }
    })
  },

  handleInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  chooseImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
      }
    })
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.src
    wx.previewImage({
      current,
      urls: this.data.images
    })
  }
})