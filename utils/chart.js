/**
 * K线图绘制工具
 * 使用Canvas绘制人生运势K线图
 */

/**
 * 绘制K线图
 * @param {Object} ctx Canvas上下文
 * @param {Array} fortuneData 运势数据数组 [{age, score, trend}, ...]
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Object} options 配置选项
 */
function drawKLineChart(ctx, fortuneData, width, height, options = {}) {
  const {
    padding = { top: 40, right: 30, bottom: 50, left: 50 },
    gridColor = '#e0e0e0',
    upColor = '#26a69a',      // 上涨绿色
    downColor = '#ef5350',    // 下跌红色
    flatColor = '#999',       // 平缓灰色
    lineColor = '#ff6b35',    // 趋势线颜色
    textColor = '#666',
    fontSize = 12
  } = options;

  // 清空画布
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  // 计算绘图区域
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const chartX = padding.left;
  const chartY = padding.top;

  // 数据范围
  const scores = fortuneData.map(item => item.score);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);
  const scoreRange = maxScore - minScore || 100;

  // 计算每个数据点的位置
  const dataPoints = fortuneData.map((item, index) => {
    const x = chartX + (index / (fortuneData.length - 1)) * chartWidth;
    const y = chartY + chartHeight - ((item.score - minScore) / scoreRange) * chartHeight;
    return { ...item, x, y };
  });

  // 绘制网格线
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  
  // 水平网格线（分数线）
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = chartY + (i / gridLines) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartWidth, y);
    ctx.stroke();

    // 绘制分数标签
    const score = maxScore - (i / gridLines) * scoreRange;
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(score).toString(), chartX - 10, y + 4);
  }

  // 垂直网格线（年龄线，每10岁一条）
  const ageInterval = 10;
  for (let age = 0; age <= 100; age += ageInterval) {
    const index = age - 1;
    if (index >= 0 && index < dataPoints.length) {
      const x = dataPoints[index].x;
      ctx.beginPath();
      ctx.moveTo(x, chartY);
      ctx.lineTo(x, chartY + chartHeight);
      ctx.stroke();

      // 绘制年龄标签
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(age.toString(), x, chartY + chartHeight + 20);
    }
  }

  // 绘制趋势线
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  dataPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  // 绘制K线
  const barWidth = Math.max(1, chartWidth / fortuneData.length * 0.6);
  dataPoints.forEach((point, index) => {
    if (index === 0) return; // 第一年没有前一年的数据，无法计算涨跌

    const prevPoint = dataPoints[index - 1];
    const openY = prevPoint.y;
    const closeY = point.y;
    const highY = Math.min(openY, closeY);
    const lowY = Math.max(openY, closeY);

    // 确定颜色
    let color = flatColor;
    if (point.trend === 'up') {
      color = upColor;
    } else if (point.trend === 'down') {
      color = downColor;
    }

    // 绘制K线实体
    ctx.fillStyle = color;
    ctx.fillRect(point.x - barWidth / 2, highY, barWidth, lowY - highY);

    // 绘制上下影线（简化版，只显示主要趋势）
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(point.x, highY);
    ctx.lineTo(point.x, Math.min(openY, closeY) - 2);
    ctx.moveTo(point.x, lowY);
    ctx.lineTo(point.x, Math.max(openY, closeY) + 2);
    ctx.stroke();
  });

  // 绘制数据点
  ctx.fillStyle = lineColor;
  dataPoints.forEach((point, index) => {
    if (index % 10 === 0 || index === dataPoints.length - 1) {
      // 每10岁显示一个点，最后一个点也显示
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 绘制标题和标签
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize + 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('人生运势K线图 (1-100岁)', width / 2, 20);

  // Y轴标签
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('运势分数', 0, 0);
  ctx.restore();

  // X轴标签
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('年龄', width / 2, height - 10);

  return dataPoints;
}

/**
 * 获取点击位置对应的数据点
 * @param {Array} dataPoints 数据点数组
 * @param {Number} x 点击X坐标
 * @param {Number} y 点击Y坐标
 * @param {Number} threshold 点击阈值（像素）
 * @returns {Object|null} 匹配的数据点
 */
function getPointAtPosition(dataPoints, x, y, threshold = 20) {
  for (let point of dataPoints) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    if (distance <= threshold) {
      return point;
    }
  }
  return null;
}

module.exports = {
  drawKLineChart,
  getPointAtPosition
};
