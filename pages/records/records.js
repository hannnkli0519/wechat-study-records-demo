Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    today: 0,
    navHeight: 44,
    statusBarHeight: 20,
    calendar: [],
    stats: {
      monthlyDays: 0,
      missedDays: 0,
      punchRate: 0
    },
    history: []
  },

  onLoad() {
    this.calculateNavHeight()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()

    this.setData({
      currentYear: year,
      currentMonth: month,
      today: day
    })

    this.fetchCloudData()
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

  fetchCloudData() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'punch_manager',
      data: {
        action: 'getRecords',
        data: { year: this.data.currentYear, month: this.data.currentMonth }
      },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          const payload = res.result.data || { checkins: [], entries: [] }
          const checkins = payload.checkins || []
          const entries = payload.entries || []

          const punchedDaysSet = new Set()
          checkins.forEach(item => {
            if (item.dateStr && item.dateStr.length >= 10) {
              const day = parseInt(item.dateStr.slice(8, 10), 10)
              if (!Number.isNaN(day)) punchedDaysSet.add(day)
            }
          })
          const punchedDays = Array.from(punchedDaysSet)

          const history = entries.map(item => ({
            date: item.dateStr ? item.dateStr.split('-').slice(1).join('月') + '日' : '未知',
            time: item.timeStr || '',
            content: item.content || ''
          }))

          this.setData({ history })
          this.generateCalendar(this.data.currentYear, this.data.currentMonth, punchedDays)

          const now = new Date()
          const isCurrentMonth = this.data.currentYear === now.getFullYear() && this.data.currentMonth === now.getMonth() + 1
          const daysElapsed = isCurrentMonth ? this.data.today : new Date(this.data.currentYear, this.data.currentMonth, 0).getDate()

          const monthlyDays = punchedDays.length
          const missedDays = daysElapsed - monthlyDays
          const punchRate = Math.round((monthlyDays / daysElapsed) * 100) || 0

          this.setData({
            'stats.monthlyDays': monthlyDays,
            'stats.missedDays': missedDays < 0 ? 0 : missedDays,
            'stats.punchRate': punchRate
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '数据获取失败', icon: 'none' })
      }
    })
  },

  generateCalendar(year, month, punchedDays = []) {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    
    // 0 is Sunday in getDay(), we want Monday as first column
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    
    const calendar = []
    
    // Previous month filler
    const prevMonthDays = new Date(year, month - 1, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      calendar.push({
        day: prevMonthDays - i,
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === this.data.today,
        isPunched: punchedDays.includes(i)
      })
    }
    
    // Next month filler
    const totalSlots = 42 // 6 weeks
    const remainingSlots = totalSlots - calendar.length
    for (let i = 1; i <= remainingSlots; i++) {
      calendar.push({
        day: i,
        isCurrentMonth: false
      })
    }
    
    this.setData({ calendar })
  }
})
