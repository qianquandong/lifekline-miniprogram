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
    
    console.log('Loaded analysisData:', analysisData)
    
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
    
    console.log('Set data:', {
      hasAnalysisData: !!analysisData,
      hasPersonality: !!analysisData.personality,
      hasCareer: !!analysisData.career,
      hasWealth: !!analysisData.wealth,
      hasMarriage: !!analysisData.marriage,
      hasHealth: !!analysisData.health,
      hasBazi: !!this.data.bazi,
      activeTab: this.data.activeTab
    })

    // 获取系统信息，计算画布尺寸
    wx.getSystemInfo({
      success: (res) => {
        // 计算可用宽度：屏幕宽度(px) - 左右padding(60rpx转px) - 卡片padding(40rpx转px)
        // 1rpx = 屏幕宽度(px) / 750
        const rpxToPx = res.windowWidth / 750
        const chartWidth = res.windowWidth - 60 * rpxToPx - 40 * rpxToPx
        const chartHeight = 500 * rpxToPx
        
        this.setData({
          chartWidth: chartWidth,
          chartHeight: chartHeight
        }, () => {
          // 如果当前在图表标签页，立即绘制
          if (this.data.activeTab === 'chart') {
            setTimeout(() => {
              this.drawChart()
            }, 300)
          }
        })
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
      // 确保尺寸已计算
      if (!this.data.chartWidth || !this.data.chartHeight) {
        wx.getSystemInfo({
          success: (res) => {
            const rpxToPx = res.windowWidth / 750
            const chartWidth = res.windowWidth - 60 * rpxToPx - 40 * rpxToPx
            const chartHeight = 500 * rpxToPx
            this.setData({
              chartWidth: chartWidth,
              chartHeight: chartHeight
            }, () => {
              setTimeout(() => {
                this.drawChart()
              }, 300)
            })
          }
        })
      } else {
        setTimeout(() => {
          this.drawChart()
        }, 300)
      }
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
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败，跳转到首页
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }
      })
    } else {
      // 如果没有上一页，直接跳转到首页
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },

  // 绘制K线图
  drawChart() {
    const { analysisData, chartWidth, chartHeight } = this.data
    
    // 向后兼容：如果数据中有fortune字段但没有growth字段，自动转换
    if (analysisData && analysisData.fortune && !analysisData.growth) {
      analysisData.growth = analysisData.fortune
    }
    
    if (!analysisData || !analysisData.growth || !chartWidth || !chartHeight) {
      console.log('Missing data:', { analysisData: !!analysisData, growth: !!analysisData?.growth, chartWidth, chartHeight })
      return
    }

    // 使用setTimeout确保DOM已渲染
    setTimeout(() => {
      const query = wx.createSelectorQuery().in(this)
      query.select('#kline-canvas').node().exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          console.error('Canvas not found, retrying...')
          setTimeout(() => this.drawChart(), 500)
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('Canvas context not found')
          return
        }

        const dpr = wx.getSystemInfoSync().pixelRatio || 2
        
        canvas.width = chartWidth * dpr
        canvas.height = chartHeight * dpr
        ctx.scale(dpr, dpr)

        // 绘制图表
        try {
          const dataPoints = chartUtil.drawKLineChart(
            ctx,
            analysisData.growth,
            chartWidth,
            chartHeight,
            {
              padding: { top: 50, right: 20, bottom: 60, left: 60 },
              fontSize: 10
            }
          )

          // 保存数据点用于点击交互
          this.dataPoints = dataPoints
          console.log('Chart drawn successfully')
        } catch (error) {
          console.error('Error drawing chart:', error)
        }
      })
    }, 500)
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
