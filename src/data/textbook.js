// 统编教材目录层（Task：教材同步）。
// 设计：从 LESSONS[subject].texts[].ref 解析「册 · 单元」，把散落的统编课文聚合成
// 可导航的「年级 → 学科 → 册 → 单元 → 课文」树。ref 形如 "一年级上册 · 汉语拼音"，
// 解析后按「册 → 单元」组织；单元内课文保留其所属 lesson 标题与课后习题。
// 仅使用 subjects.js 中真实存在的统编出处，绝不编造教材内容。
import { LESSONS } from './subjects.js';
import { GRADES } from './content.js';

export const SUBJECT_IDS = ['chinese', 'math', 'english'];

// 课文打卡键：学科::课节id::课文序号，全局唯一且稳定，用于状态索引。
export const textKey = (subjectId, lessonId, index) => `${subjectId}::${lessonId}::${index}`;

// 解析 ref："一年级上册 · 汉语拼音" → { volume:'一年级上册', unit:'汉语拼音' }
function parseRef(ref) {
  const parts = String(ref || '').split('·').map((s) => s.trim());
  return { volume: parts[0] || '未分册', unit: parts[1] || '其他' };
}

// 构建某年级某学科的教材树；无课文时返回 null（页面据此显示“整理中”）。
function buildSubject(grade, subjectId) {
  const lessons = LESSONS[subjectId] || [];
  const unitsMap = new Map();
  let volume = '';
  lessons.forEach((lesson) => {
    (lesson.texts || []).forEach((t, i) => {
      const { volume: vol, unit } = parseRef(t.ref);
      volume = vol;
      if (!unitsMap.has(unit)) unitsMap.set(unit, []);
      unitsMap.get(unit).push({
        key: textKey(subjectId, lesson.id, i),
        title: t.title,
        ref: t.ref || '',
        exercises: t.exercises || [],
        lessonTitle: lesson.title,
        lessonId: lesson.id,
        index: i,
      });
    });
  });
  if (unitsMap.size === 0) return null;
  const units = Array.from(unitsMap.entries()).map(([name, texts]) => ({ name, texts }));
  return { volume, units };
}

// 教材索引：TEXTBOOK[grade][subjectId] = { volume, units } | null
const TEXTBOOK = {};
GRADES.forEach((g) => {
  TEXTBOOK[g] = {};
  SUBJECT_IDS.forEach((sid) => {
    TEXTBOOK[g][sid] = buildSubject(g, sid);
  });
});

export const getTextbook = (grade, subjectId) => TEXTBOOK[grade]?.[subjectId] || null;
export const getTextbookUnits = (grade, subjectId) => getTextbook(grade, subjectId)?.units || [];

// 统计某年级某学科课文总数（用于打卡总进度）。
export const countTexts = (grade, subjectId) => {
  const units = getTextbookUnits(grade, subjectId);
  return units.reduce((sum, u) => sum + u.texts.length, 0);
};

export const TEXTBOOK_INDEX = TEXTBOOK;
export { GRADES };
