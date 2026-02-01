/**
 * AI提示词生成工具
 * 根据传统干支信息生成完整的AI分析提示词
 */

/**
 * 生成AI分析提示词
 * @param {Object} baziResult 传统干支计算结果
 * @returns {String} 完整的提示词
 */
function generatePrompt(baziResult) {
  if (!baziResult || !baziResult.bazi) {
    throw new Error('传统干支信息不完整');
  }

  const { year, month, day, hour, input } = baziResult;
  const genderText = input.gender === 'male' ? '男' : '女';
  const birthInfo = `${input.birthDate} ${input.birthTime}`;

  const prompt = `请作为一位专业的传统文化分析师，对以下传统干支信息进行深度分析。

## 基本信息
- 出生日期：${birthInfo}
- 性别：${genderText}
- 四柱八字：${year.full} ${month.full} ${day.full} ${hour.full}
- 年柱：${year.full}（${year.gan}${year.zhi}）
- 月柱：${month.full}（${month.gan}${month.zhi}）
- 日柱：${day.full}（${day.gan}${day.zhi}）
- 时柱：${hour.full}（${hour.gan}${hour.zhi}），${hour.name}

## 分析要求

请从以下维度进行详细分析：

### 1. 性格分析（personality）
分析此人的性格特点、行为模式、思维习惯、优缺点等，字数控制在200-300字。

### 2. 事业分析（career）
分析事业发展方向、适合的行业、职业建议、事业发展特点等，字数控制在200-300字。

### 3. 财富分析（wealth）
分析财运特点、财富积累方式、理财建议、财富管理等，字数控制在200-300字。

### 4. 婚姻分析（marriage）
分析感情特点、情感关系、配偶特征、感情建议等，字数控制在200-300字。

### 5. 健康分析（health）
分析健康状况、需要注意的方面、养生建议等，字数控制在200-300字。

### 6. 成长发展曲线（growth）
请为1-100岁每年生成成长数据，包括：
- age: 年龄（1-100）
- score: 成长指数（0-100，50为基准线）
- trend: 趋势（"up"表示上升，"down"表示下降，"flat"表示平稳）

成长指数应基于：
- 大运流年的影响
- 五行生克关系
- 十神配置
- 流年与命局的互动

请确保成长曲线有合理的起伏，不要过于平直，也不要过于极端。

## 输出格式要求

请严格按照以下JSON格式输出，不要添加任何其他文字说明：

{
  "personality": "性格分析内容...",
  "career": "事业分析内容...",
  "wealth": "财富分析内容...",
  "marriage": "婚姻分析内容...",
  "health": "健康分析内容...",
  "growth": [
    {
      "age": 1,
      "score": 65,
      "trend": "up"
    },
    {
      "age": 2,
      "score": 70,
      "trend": "up"
    }
    // ... 继续到100岁
  ]
}

注意：
1. growth数组必须包含1-100岁共100个数据，不能遗漏
2. score的取值范围是0-100
3. trend只能是"up"、"down"或"flat"之一
4. 请确保JSON格式完全正确，可以直接被解析
5. 成长曲线应该有一定的逻辑性，考虑大运周期的影响`;

  return prompt;
}

/**
 * 生成简化版提示词（用于预览）
 * @param {Object} baziResult 传统干支计算结果
 * @returns {String} 简化的提示词
 */
function generatePromptPreview(baziResult) {
  if (!baziResult || !baziResult.bazi) {
    return '';
  }

  const { year, month, day, hour, input } = baziResult;
  const genderText = input.gender === 'male' ? '男' : '女';
  
  return `传统干支：${year.full} ${month.full} ${day.full} ${hour.full}
性别：${genderText}
出生：${input.birthDate} ${input.birthTime}`;
}

module.exports = {
  generatePrompt,
  generatePromptPreview
};
