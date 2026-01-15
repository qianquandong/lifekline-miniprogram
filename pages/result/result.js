// result.js
const chartUtil = require('../../utils/chart.js')

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
    },
    // K线图相关
    chartWidth: 0,
    chartHeight: 0,
    selectedPoint: null, // 选中的数据点
    showPointDetail: false
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

    // 获取系统信息，计算画布尺寸
    wx.getSystemInfo({
      success: (res) => {
        const chartWidth = res.windowWidth - 60; // 减去左右padding
        const chartHeight = 500; // 固定高度
        this.setData({
          chartWidth: chartWidth,
          chartHeight: chartHeight
        })
        // 如果当前在图表标签页，立即绘制
        if (this.data.activeTab === 'chart') {
          this.drawChart()
        }
      }
    })
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    
    // 切换到图表标签页时绘制图表
    if (tab === 'chart') {
      setTimeout(() => {
        this.drawChart()
      }, 100)
    }
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
  },

  // 绘制K线图
  drawChart() {
    const { analysisData, chartWidth, chartHeight } = this.data
    
    if (!analysisData || !analysisData.fortune || !chartWidth || !chartHeight) {
      return
    }

    // 使用setTimeout确保DOM已渲染
    setTimeout(() => {
      const query = wx.createSelectorQuery().in(this)
      query.select('#kline-canvas').node().exec((res) => {
        const canvas = res[0].node
        if (!canvas) {
          console.error('Canvas not found, retrying...')
          setTimeout(() => this.drawChart(), 200)
          return
        }

        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio || 2
        
        canvas.width = chartWidth * dpr
        canvas.height = chartHeight * dpr
        ctx.scale(dpr, dpr)

        // 绘制图表
        const dataPoints = chartUtil.drawKLineChart(
          ctx,
          analysisData.fortune,
          chartWidth,
          chartHeight,
          {
            padding: { top: 50, right: 20, bottom: 60, left: 60 },
            fontSize: 10
          }
        )

        // 保存数据点用于点击交互
        this.dataPoints = dataPoints
      })
    }, 300)
  },

  // 处理canvas点击事件
  onCanvasTap(e) {
    if (!this.dataPoints) return

    const query = wx.createSelectorQuery().in(this)
    query.select('#kline-canvas').boundingClientRect((rect) => {
      if (!rect) return
      
      const x = e.detail.x - rect.left
      const y = e.detail.y - rect.top

      const point = chartUtil.getPointAtPosition(this.dataPoints, x, y, 30)
      
      if (point) {
        this.setData({
          selectedPoint: {
            age: point.age,
            score: point.score,
            trend: point.trend
          },
          showPointDetail: true
        })
      } else {
        this.setData({
          showPointDetail: false
        })
      }
    }).exec()
  },

  // 关闭详情
  closePointDetail() {
    this.setData({
      showPointDetail: false,
      selectedPoint: null
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})
