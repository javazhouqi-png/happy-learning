// 学习档案导出 / 导入工具。纯函数，不依赖 React，便于在任意组件按需引入。
// 档案 = 整个应用状态（积分 / 进度 / 错题 / 家长设置）的 JSON 快照，
// 用于跨设备备份与恢复；导入后由 AppContext 的 HYDRATE 动作兜底缺字段。

const APP_TAG = 'happy-learning';
const SCHEMA = 1;

/**
 * 导出当前档案：序列化为带元信息的 JSON 并触发浏览器下载。
 * @param {object} state 应用全局状态（来自 useApp().state）
 */
export function exportProfile(state) {
  const payload = {
    app: APP_TAG,
    schema: SCHEMA,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `happy-learning-档案-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * 导入档案：读取 File，解析并做基础校验，返回干净的状态对象（交给 HYDRATE reducer 兜底）。
 * 校验失败抛出带中文信息的 Error，由调用方捕获后提示用户。
 * @param {File} file 用户选择的 JSON 档案
 * @returns {Promise<object>} 状态快照
 */
export async function importProfile(file) {
  if (!file) throw new Error('未选择档案文件');
  let text;
  try {
    text = await file.text();
  } catch {
    throw new Error('无法读取文件');
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('文件不是有效的 JSON 档案');
  }
  if (parsed.app !== APP_TAG) throw new Error('文件不是「快乐学园」的档案');
  if (!parsed.state || typeof parsed.state !== 'object') throw new Error('档案内容缺失，无法导入');
  return parsed.state;
}
