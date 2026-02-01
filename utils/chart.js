/**
 * K线图绘制工具
 * 使用Canvas绘制人生成长曲线图
 */

/**
 * 绘制K线图
 * @param {Object} ctx Canvas上下文
 * @param {Array} growthData 成长数据数组 [{age, score, trend}, ...]
 * @param {Number} width 画布宽度
 * @param {Number} height 画布高度
 * @param {Object} options 配置选项
 */
function drawKLineChart(ctx, growthData, width, height, options = {}) {
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
  const scores = growthData.map(item => item.score);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);
  const scoreRange = maxScore - minScore || 100;

  // 计算每个数据点的位置
  const dataPoints = growthData.map((item, index) => {
    const x = chartX + (index / (growthData.length - 1)) * chartWidth;
    const y = chartY + chartHeight - ((item.score - minScore) / scoreRange) * chartHeight;
    return { ...item, x, y };
  });

  // 绘制网格线（减淡）
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.3;
  
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
    ctx.globalAlpha = 0.6;
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
      ctx.globalAlpha = 0.3;
      ctx.stroke();

      // 绘制年龄标签
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6;
      ctx.fillText(age.toString(), x, chartY + chartHeight + 20);
    }
  }

  ctx.globalAlpha = 1;

  // 绘制平滑曲线（使用三次贝塞尔曲线）
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // 创建平滑曲线路径
  function createSmoothPath(points) {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      if (i === 0) {
        // 第一个点：使用下一个点作为控制点
        const cp1x = current.x + (next.x - current.x) * 0.3;
        const cp1y = current.y;
        ctx.quadraticCurveTo(cp1x, cp1y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      } else if (i === points.length - 2) {
        // 最后一个点：使用当前点作为控制点
        const cp2x = next.x - (next.x - current.x) * 0.3;
        const cp2y = next.y;
        ctx.quadraticCurveTo(cp2x, cp2y, next.x, next.y);
      } else {
        // 中间点：使用前后点的平均值作为控制点
        const prev = points[i - 1];
        const cp1x = current.x + (next.x - prev.x) * 0.15;
        const cp1y = current.y + (next.y - prev.y) * 0.15;
        const cp2x = next.x - (next.x - prev.x) * 0.15;
        const cp2y = next.y - (next.y - prev.y) * 0.15;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }
    }
  }
  
  createSmoothPath(dataPoints);
  ctx.stroke();

  // 绘制曲线下方的填充（渐变）
  if (dataPoints.length > 0) {
    const gradient = ctx.createLinearGradient(
      chartX, chartY,
      chartX, chartY + chartHeight
    );
    gradient.addColorStop(0, 'rgba(200, 100, 50, 0.12)');
    gradient.addColorStop(0.5, 'rgba(200, 100, 50, 0.06)');
    gradient.addColorStop(1, 'rgba(200, 100, 50, 0.01)');
    
    ctx.fillStyle = gradient;
    
    // 创建填充路径
    ctx.beginPath();
    ctx.moveTo(dataPoints[0].x, chartY + chartHeight);
    
    // 使用相同的平滑曲线
    createSmoothPath(dataPoints);
    
    // 闭合路径到底部
    ctx.lineTo(dataPoints[dataPoints.length - 1].x, chartY + chartHeight);
    ctx.closePath();
    ctx.fill();
  }

  // 绘制K线（减淡显示，作为背景）
  const barWidth = Math.max(1, chartWidth / growthData.length * 0.4);
  ctx.globalAlpha = 0.3;
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

    // 绘制K线实体（减淡）
    ctx.fillStyle = color;
    ctx.fillRect(point.x - barWidth / 2, highY, barWidth, lowY - highY);
  });
  ctx.globalAlpha = 1;

  // 绘制关键数据点（每10岁）
  ctx.fillStyle = lineColor;
  ctx.globalAlpha = 0.8;
  dataPoints.forEach((point, index) => {
    if (index % 10 === 0 || index === dataPoints.length - 1) {
      // 每10岁显示一个点，最后一个点也显示
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;

  // 绘制标题和标签（减淡）
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.7;
  ctx.font = `600 ${fontSize + 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('人生成长曲线图 (1-100岁)', width / 2, 24);

  // X轴标签
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('年龄', width / 2, height - 10);
  ctx.globalAlpha = 1;

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
