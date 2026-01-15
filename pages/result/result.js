// result.js
Page({
  data: {
    analysisData: null,
    bazi: null,
    activeTab: 'report', // 'report' | 'chart'
    expandedSections: {
      personality: true,
      career: true,
      wealth: true,
      marriage: true,
      health: true
    }
  },

  onLoad() {
    // 从本地存储读取分析数据
    const analysisData = wx.getStorageSync('analysisData')
    
    if (!analysisData) {
      wx.showToast({
        title: '没有找到分析数据',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      analysisData: analysisData,
      bazi: analysisData.bazi
    })
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
  },

  // 切换章节展开/收起
  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    const expandedSections = { ...this.data.expandedSections }
    expandedSections[section] = !expandedSections[section]
    this.setData({
      expandedSections: expandedSections
    })
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})
