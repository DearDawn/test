function calculateMoonPhase(date) {
  // 基本时间单位 (天)
  const lunarCycleDays = 29.53058867;

  // 计算1970年1月1日到当前日期的天数
  const msPerDay = 24 * 60 * 60 * 1000;
  const epoch = new Date(1970, 0, 1);
  const daysSinceEpoch = (date - epoch) / msPerDay;

  // 参考新月时间：2000年1月6日18:14:00 UTC
  const referenceNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const daysSinceReferenceNewMoon = (date - referenceNewMoon) / msPerDay;

  // 计算月相天数
  const lunarAge = daysSinceReferenceNewMoon % lunarCycleDays;
  const moonPhase = (lunarAge < 0) ? lunarAge + lunarCycleDays : lunarAge;

  console.log('[dodo] ', 'moonPhase', moonPhase);
  return moonPhase;
}

// 示例使用
const today = new Date();
const moonPhase = calculateMoonPhase(today);
console.log(`今天的月相是: ${moonPhase}`);