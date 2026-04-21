const util = require('../../utils/util.js')

Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    today: 0,
    calendar: [],
    stats: {
      monthlyDays: 19,
      missedDays: 2,
      punchRate: 95
    },
    history: [
      { date: '04月20日', time: '08:30', content: '完成了《英语语法精讲》前三章的复习，掌握了虚拟语气的核心用法。' },
      { date: '04月19日', time: '10:15', content: '刷了50个雅思核心词汇，重点关注了环境类话题的表达。' },
      { date: '04月18日', time: '21:00', content: '观看了一个小时的深度学习数学基础视频，理解了反向传播算法的数学原理。' },
      { date: '04月17日', time: '07:45', content: '坚持晨读30分钟，模仿了TED演讲的语音语调，感觉口语更有节奏感了。' },
      { date: '04月16日', time: '13:20', content: '整理了近一周的错题集，发现概率统计部分的逻辑还是容易混淆，明天重点突破。' },
      { date: '04月15日', time: '19:40', content: '阅读了《代码整洁之道》第五章，学习了如何通过命名和函数拆分提高代码质量。' },
      { date: '04月14日', time: '08:00', content: '早起打卡，完成了20分钟的冥想和10公里的晨跑。' },
      { date: '04月13日', time: '22:30', content: '复习了React Hooks的高级用法，动手实现了一个自定义的useFetch。' }
    ]
  },

  onLoad() {
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

  fetchCloudData() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'punch_manager',
      data: { action: 'getRecords' },
      success: res => {
        wx.hideLoading()
        if (res.result.success) {
          const rawHistory = res.result.data
          // 格式化历史记录
          const history = rawHistory.map(item => ({
            date: item.dateStr ? item.dateStr.split('-').slice(1).join('月') + '日' : '未知',
            time: item.timeStr || '',
            content: item.content
          }))
          
          // 获取已打卡日期列表用于日历
          const punchedDays = rawHistory
            .filter(item => {
              const d = new Date(item.createTime)
              return d.getFullYear() === this.data.currentYear && (d.getMonth() + 1) === this.data.currentMonth
            })
            .map(item => new Date(item.createTime).getDate())

          this.setData({ history })
          this.generateCalendar(this.data.currentYear, this.data.currentMonth, punchedDays)
          
          // 更新统计数据
          this.setData({
            'stats.monthlyDays': punchedDays.length,
            'stats.punchRate': Math.round((punchedDays.length / this.data.today) * 100) || 0
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