#!/usr/bin/env bash
# 配色门禁（混合裁决，见方案 §7.2 / IMPROVEMENT-PLAN §7.2 总监最终裁决）：
#   - 白名单路径（docs/design/illustration-whitelist.json 的 match）整体跳过硬编码色检查
#   - 其余源码文件：仅允许 #fff/#000，其余硬编码色一律失败（功能 UI 必须走 var(--token)，零豁免）
#   - 令牌字典 src/index.css 本身豁免（它是令牌定义，不是使用）
# emoji 图标禁令不在此脚本：按 IMPROVEMENT-PLAN §4.5 交给 ESLint no-restricted-syntax（unicode 区间），
#   避免误伤内容文案（吉祥物台词 / 庆祝语 / 题目文本）中的 emoji。
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"

WHITELIST="docs/design/illustration-whitelist.json"
[[ -f "$WHITELIST" ]] || { echo "✗ 找不到插画白名单：$WHITELIST"; exit 1; }
mapfile -t PATTERNS < <(grep -oE '"src/[^"]+"' "$WHITELIST" | tr -d '"' | sed 's/\\//g')
((${#PATTERNS[@]})) || { echo "✗ 白名单未含任何 src/ 路径模式"; exit 1; }

is_whitelisted() {
  local f="$1" p prefix suffix
  for p in "${PATTERNS[@]}"; do
    if [[ "$p" == *"**"* ]]; then
      prefix="${p%%\*\*}"; suffix="${p##*\*\*}"
      [[ "$f" == "$prefix"* ]] && { [[ -z "$suffix" ]] || [[ "$f" == *"$suffix" ]]; } && return 0
    elif [[ "$p" == *"*"* ]]; then
      [[ "$f" == $p ]] && return 0
    else
      [[ "$f" == "$p" ]] && return 0
    fi
  done
  return 1
}

FAIL=0
while IFS= read -r f; do
  [[ "$f" == "src/index.css" ]] && continue
  is_whitelisted "$f" && continue
  if grep -niE '#[0-9a-fA-F]{3,8}' "$f" | grep -viE '#fff|#ffffff|#000|#000000' | grep -q .; then
    echo "✗ P0 违规：未令牌化硬编码色 in $f"
    grep -niE '#[0-9a-fA-F]{3,8}' "$f" | grep -viE '#fff|#ffffff|#000|#000000'
    FAIL=1
  fi
done < <(find src -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) ! -path '*/assets/*' 2>/dev/null)

# 分包退化断言：主 chunk 不得超过 180 kB（防年级数据被静态 re-export 拉回主包，IMPROVEMENT-PLAN §3/§4.5）
if [[ -d dist/assets ]]; then
  # 入口块（Vite 默认仅入口命名为 index-*.js；vendor/页面块另有命名，不命中）。
  # 用 glob 取首块体积，避免 find -exec 在受限环境下因环境变量过大而失败。
  MAIN=$(for f in dist/assets/index-*.js; do wc -c "$f"; break; done 2>/dev/null | awk '{print $1}')
  if [[ -z "$MAIN" || "$MAIN" -ge 184320 ]]; then
    echo "✗ 主 chunk ${MAIN:-?} B 超阈值，年级数据可能被静态 re-export 拉回主包"
    FAIL=1
  fi
fi

# 年级数据隔离断言：GRADE_LEARNING 专有数据不应进入首屏共享 content 块。
# 若年级数据被静态引用拉回主包，content-*.js 中会出现本应只在按需 grade chunk 出现的字符串。
if [[ -d dist/assets ]]; then
  for f in dist/assets/content-*.js; do
    [[ -e "$f" ]] || continue
    if grep -q 'g6-sc-micro' "$f"; then
      echo "✗ 年级数据泄漏到 content 共享块：$f 含 GRADE_LEARNING 专有字符串 g6-sc-micro"
      echo "  年级数据应仅在 dist/assets/grade-*.js 中按需加载，不得进入首屏。"
      FAIL=1
    fi
  done
fi

[[ $FAIL -eq 0 ]] && { echo "✓ 配色门禁 + 分包断言通过"; exit 0; }
echo "门禁失败：功能 UI 出现未令牌化硬编码色。请改用 src/index.css 的 --c-* 令牌；纯品牌插画请加入 docs/design/illustration-whitelist.json。"
exit 1
