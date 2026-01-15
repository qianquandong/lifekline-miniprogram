// index.js
const baziUtil = require('../../utils/bazi.js')
const promptUtil = require('../../utils/prompt.js')

Page({
  data: {
    // 表单数据
    birthDate: '',
    birthTime: '',
    gender: 'male', // 'male' | 'female'
    
    // 计算结果显示
    baziResult: null,
    errorMsg: '',
    
    // 提示词相关
    promptText: '',
    showPrompt: false,
    
    // AI结果导入
    aiResultInput: '',
    showImportDialog: false,
    
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
      
      // 自动生成提示词
      const promptText = promptUtil.generatePrompt(result)
      
      this.setData({
        baziResult: result,
        promptText: promptText,
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
  },

  // 生成提示词
  generatePrompt() {
    if (!this.data.baziResult) {
      wx.showToast({
        title: '请先计算八字',
        icon: 'none'
      })
      return
    }

    try {
      const promptText = promptUtil.generatePrompt(this.data.baziResult)
      this.setData({
        promptText: promptText,
        showPrompt: true
      })
    } catch (error) {
      wx.showToast({
        title: '生成提示词失败',
        icon: 'none'
      })
    }
  },

  // 复制提示词
  copyPrompt() {
    if (!this.data.promptText) {
      wx.showToast({
        title: '提示词为空',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: this.data.promptText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  // 关闭提示词预览
  closePrompt() {
    this.setData({
      showPrompt: false
    })
  },

  // 打开导入对话框
  openImportDialog() {
    this.setData({
      showImportDialog: true,
      aiResultInput: ''
    })
  },

  // 关闭导入对话框
  closeImportDialog() {
    this.setData({
      showImportDialog: false,
      aiResultInput: ''
    })
  },

  // AI结果输入
  onAiResultInput(e) {
    this.setData({
      aiResultInput: e.detail.value
    })
  },

  // 导入AI结果
  importAiResult() {
    const { aiResultInput } = this.data

    if (!aiResultInput || !aiResultInput.trim()) {
      wx.showToast({
        title: '请输入AI返回的JSON数据',
        icon: 'none'
      })
      return
    }

    try {
      // 尝试解析JSON
      let jsonData
      try {
        jsonData = JSON.parse(aiResultInput.trim())
      } catch (e) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = aiResultInput.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('无法找到有效的JSON数据')
        }
      }

      // 验证数据格式
      if (!jsonData.personality || !jsonData.career || !jsonData.wealth || 
          !jsonData.marriage || !jsonData.health || !Array.isArray(jsonData.fortune)) {
        throw new Error('数据格式不完整，缺少必要字段')
      }

      if (jsonData.fortune.length !== 100) {
        throw new Error(`运势数据不完整，应该有100条数据，实际有${jsonData.fortune.length}条`)
      }

      // 验证fortune数组格式
      for (let i = 0; i < jsonData.fortune.length; i++) {
        const item = jsonData.fortune[i]
        if (!item.hasOwnProperty('age') || !item.hasOwnProperty('score') || !item.hasOwnProperty('trend')) {
          throw new Error(`第${i + 1}条运势数据格式错误`)
        }
        if (item.age !== i + 1) {
          throw new Error(`第${i + 1}条数据年龄应为${i + 1}，实际为${item.age}`)
        }
        if (item.score < 0 || item.score > 100) {
          throw new Error(`第${i + 1}条数据分数应在0-100之间`)
        }
        if (!['up', 'down', 'flat'].includes(item.trend)) {
          throw new Error(`第${i + 1}条数据趋势应为up/down/flat之一`)
        }
      }

      // 保存到本地存储
      const analysisData = {
        ...jsonData,
        bazi: this.data.baziResult,
        importTime: new Date().toISOString()
      }

      wx.setStorageSync('analysisData', analysisData)

      // 跳转到结果页面
      wx.redirectTo({
        url: '/pages/result/result',
        success: () => {
          wx.showToast({
            title: '导入成功',
            icon: 'success'
          })
        }
      })
    } catch (error) {
      console.error('导入AI结果失败:', error)
      wx.showToast({
        title: error.message || '导入失败，请检查数据格式',
        icon: 'none',
        duration: 3000
      })
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})
