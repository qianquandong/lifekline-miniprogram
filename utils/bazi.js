/**
 * 八字计算工具
 * 将公历日期转换为四柱干支
 */

// 天干数组
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支数组
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应表（24小时制）
const SHI_CHEN = [
  { start: 23, end: 1, name: '子时', index: 0 },
  { start: 1, end: 3, name: '丑时', index: 1 },
  { start: 3, end: 5, name: '寅时', index: 2 },
  { start: 5, end: 7, name: '卯时', index: 3 },
  { start: 7, end: 9, name: '辰时', index: 4 },
  { start: 9, end: 11, name: '巳时', index: 5 },
  { start: 11, end: 13, name: '午时', index: 6 },
  { start: 13, end: 15, name: '未时', index: 7 },
  { start: 15, end: 17, name: '申时', index: 8 },
  { start: 17, end: 19, name: '酉时', index: 9 },
  { start: 19, end: 21, name: '戌时', index: 10 },
  { start: 21, end: 23, name: '亥时', index: 11 }
];

/**
 * 获取时辰索引
 * @param {Number} hour 小时（0-23）
 * @returns {Number} 时辰索引（0-11）
 */
function getShiChenIndex(hour) {
  for (let i = 0; i < SHI_CHEN.length; i++) {
    const sc = SHI_CHEN[i];
    if (sc.start > sc.end) {
      // 跨日的情况（23-1点）
      if (hour >= sc.start || hour < sc.end) {
        return sc.index;
      }
    } else {
      if (hour >= sc.start && hour < sc.end) {
        return sc.index;
      }
    }
  }
  return 0; // 默认返回子时
}

/**
 * 计算年柱
 * @param {Number} year 年份
 * @returns {Object} {gan: '天干', zhi: '地支'}
 */
function getYearZhu(year) {
  // 1984年为甲子年，以此为基准
  const baseYear = 1984;
  const offset = (year - baseYear) % 60;
  if (offset < 0) offset += 60;
  
  const ganIndex = offset % 10;
  const zhiIndex = offset % 12;
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex]
  };
}

/**
 * 计算月柱
 * @param {Number} year 年份
 * @param {Number} month 月份（1-12）
 * @returns {Object} {gan: '天干', zhi: '地支'}
 */
function getMonthZhu(year, month) {
  // 月支固定对应
  const monthZhiMap = {
    1: 2,  // 寅月
    2: 3,  // 卯月
    3: 4,  // 辰月
    4: 5,  // 巳月
    5: 6,  // 午月
    6: 7,  // 未月
    7: 8,  // 申月
    8: 9,  // 酉月
    9: 10, // 戌月
    10: 11, // 亥月
    11: 0,  // 子月
    12: 1   // 丑月
  };
  
  const zhiIndex = monthZhiMap[month] || 2;
  
  // 月干根据年干推算（五虎遁）
  const yearGan = getYearZhu(year).gan;
  const yearGanIndex = TIAN_GAN.indexOf(yearGan);
  
  // 甲己之年丙作首，乙庚之年戊为头，丙辛之年寻庚起，丁壬壬寅顺水流，若问戊癸何处起，甲寅之上好追求
  const monthGanStartMap = {
    0: 2, // 甲年 -> 丙
    5: 2, // 己年 -> 丙
    1: 4, // 乙年 -> 戊
    6: 4, // 庚年 -> 戊
    2: 6, // 丙年 -> 庚
    7: 6, // 辛年 -> 庚
    3: 8, // 丁年 -> 壬
    8: 8, // 壬年 -> 壬
    4: 0, // 戊年 -> 甲
    9: 0  // 癸年 -> 甲
  };
  
  const startGanIndex = monthGanStartMap[yearGanIndex] || 2;
  const ganIndex = (startGanIndex + zhiIndex - 2) % 10;
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex]
  };
}

/**
 * 计算日柱
 * @param {Number} year 年份
 * @param {Number} month 月份（1-12）
 * @param {Number} day 日期（1-31）
 * @returns {Object} {gan: '天干', zhi: '地支'}
 */
function getDayZhu(year, month, day) {
  // 使用公式计算：1900年1月1日为基准日（甲子日）
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  
  // 计算天数差
  const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  
  // 计算天干地支
  const ganIndex = (daysDiff + 6) % 10; // 1900年1月1日是甲午日，所以+6
  const zhiIndex = (daysDiff + 8) % 12; // 1900年1月1日是甲午日，所以+8
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex]
  };
}

/**
 * 计算时柱
 * @param {Number} year 年份
 * @param {Number} month 月份（1-12）
 * @param {Number} day 日期（1-31）
 * @param {Number} hour 小时（0-23）
 * @returns {Object} {gan: '天干', zhi: '地支'}
 */
function getHourZhu(year, month, day, hour) {
  const zhiIndex = getShiChenIndex(hour);
  
  // 时干根据日干推算（五鼠遁）
  const dayZhu = getDayZhu(year, month, day);
  const dayGanIndex = TIAN_GAN.indexOf(dayZhu.gan);
  
  // 甲己还生甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
  const hourGanStartMap = {
    0: 0, // 甲日 -> 甲
    5: 0, // 己日 -> 甲
    1: 2, // 乙日 -> 丙
    6: 2, // 庚日 -> 丙
    2: 4, // 丙日 -> 戊
    7: 4, // 辛日 -> 戊
    3: 6, // 丁日 -> 庚
    8: 6, // 壬日 -> 庚
    4: 8, // 戊日 -> 壬
    9: 8  // 癸日 -> 壬
  };
  
  const startGanIndex = hourGanStartMap[dayGanIndex] || 0;
  const ganIndex = (startGanIndex + zhiIndex) % 10;
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex]
  };
}

/**
 * 计算完整八字
 * @param {Object} params 参数对象
 * @param {String} params.birthDate 出生日期 'YYYY-MM-DD'
 * @param {String} params.birthTime 出生时间 'HH:mm' 或 'HH'
 * @param {String} params.gender 性别 'male' | 'female'
 * @returns {Object} 八字对象
 */
function calculateBazi({ birthDate, birthTime, gender }) {
  if (!birthDate || !birthTime) {
    throw new Error('出生日期和时间不能为空');
  }
  
  const [year, month, day] = birthDate.split('-').map(Number);
  const timeParts = birthTime.split(':');
  const hour = parseInt(timeParts[0]) || 0;
  const minute = parseInt(timeParts[1]) || 0;
  
  // 验证日期有效性
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error('无效的日期');
  }
  
  // 计算四柱
  const yearZhu = getYearZhu(year);
  const monthZhu = getMonthZhu(year, month);
  const dayZhu = getDayZhu(year, month, day);
  const hourZhu = getHourZhu(year, month, day, hour);
  
  // 获取时辰名称
  const shiChenIndex = getShiChenIndex(hour);
  const shiChenName = SHI_CHEN[shiChenIndex].name;
  
  return {
    year: {
      gan: yearZhu.gan,
      zhi: yearZhu.zhi,
      full: yearZhu.gan + yearZhu.zhi
    },
    month: {
      gan: monthZhu.gan,
      zhi: monthZhu.zhi,
      full: monthZhu.gan + monthZhu.zhi
    },
    day: {
      gan: dayZhu.gan,
      zhi: dayZhu.zhi,
      full: dayZhu.gan + dayZhu.zhi
    },
    hour: {
      gan: hourZhu.gan,
      zhi: hourZhu.zhi,
      full: hourZhu.gan + hourZhu.zhi,
      name: shiChenName
    },
    // 完整八字字符串
    bazi: `${yearZhu.gan}${yearZhu.zhi} ${monthZhu.gan}${monthZhu.zhi} ${dayZhu.gan}${dayZhu.zhi} ${hourZhu.gan}${hourZhu.zhi}`,
    // 原始输入信息
    input: {
      birthDate,
      birthTime,
      gender,
      year,
      month,
      day,
      hour,
      minute
    }
  };
}

module.exports = {
  calculateBazi,
  getYearZhu,
  getMonthZhu,
  getDayZhu,
  getHourZhu,
  getShiChenIndex,
  TIAN_GAN,
  DI_ZHI,
  SHI_CHEN
};
