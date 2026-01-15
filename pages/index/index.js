// index.js
const baziUtil = require('../../utils/bazi.js')

Page({
  data: {
    // 表单数据
    birthDate: '',
    birthTime: '',
    gender: 'male', // 'male' | 'female'
    
    // 计算结果显示
    baziResult: null,
    errorMsg: '',
    
    // 测试模式
    testMode: false,
    testResults: []
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.setData({
      birthDate: `${year}-${month}-${day}`,
      birthTime: '12:00'
    })
  },

  // 选择出生日期
  onDateChange(e) {
    this.setData({
      birthDate: e.detail.value,
      errorMsg: '',
      baziResult: null
    })
  },

  // 选择出生时间
  onTimeChange(e) {
    this.setData({
      birthTime: e.detail.value,
      errorMsg: '',
      baziResult: null
    })
  },

  // 选择性别
  onGenderChange(e) {
    this.setData({
      gender: e.detail.value,
      errorMsg: '',
      baziResult: null
    })
  },

  // 计算八字
  calculateBazi() {
    const { birthDate, birthTime, gender } = this.data
    
    if (!birthDate) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none'
      })
      return
    }

    if (!birthTime) {
      wx.showToast({
        title: '请选择出生时间',
        icon: 'none'
      })
      return
    }

    try {
      const result = baziUtil.calculateBazi({
        birthDate,
        birthTime,
        gender
      })
      
      this.setData({
        baziResult: result,
        errorMsg: ''
      })

      wx.showToast({
        title: '计算成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('计算八字失败:', error)
      this.setData({
        errorMsg: error.message || '计算失败，请检查输入',
        baziResult: null
      })
      
      wx.showToast({
        title: error.message || '计算失败',
        icon: 'none',
        duration: 2000
      })
    }
  },

  // 测试功能
  runTests() {
    this.setData({
      testMode: true,
      testResults: []
    })

    const testCases = [
      {
        name: '测试1: 1990年1月1日12时',
        params: {
          birthDate: '1990-01-01',
          birthTime: '12:00',
          gender: 'male'
        }
      },
      {
        name: '测试2: 2000年6月15日8时',
        params: {
          birthDate: '2000-06-15',
          birthTime: '08:00',
          gender: 'female'
        }
      },
      {
        name: '测试3: 1985年12月25日23时',
        params: {
          birthDate: '1985-12-25',
          birthTime: '23:00',
          gender: 'male'
        }
      },
      {
        name: '测试4: 1995年3月20日0时',
        params: {
          birthDate: '1995-03-20',
          birthTime: '00:00',
          gender: 'female'
        }
      }
    ]

    const results = []
    testCases.forEach((testCase, index) => {
      try {
        const result = baziUtil.calculateBazi(testCase.params)
        results.push({
          index: index + 1,
          name: testCase.name,
          success: true,
          result: result,
          error: null
        })
      } catch (error) {
        results.push({
          index: index + 1,
          name: testCase.name,
          success: false,
          result: null,
          error: error.message
        })
      }
    })

    this.setData({
      testResults: results
    })

    const successCount = results.filter(r => r.success).length
    wx.showToast({
      title: `测试完成: ${successCount}/${results.length} 通过`,
      icon: 'success',
      duration: 2000
    })
  },

  // 关闭测试模式
  closeTestMode() {
    this.setData({
      testMode: false,
      testResults: []
    })
  }
})
