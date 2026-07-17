# Rich Editor Diff

本文档说明 `@groupher/rich-editor` 的 Diff 设计、公开 API、统计语义以及在浏览器和 Web Worker 中的推荐使用方式。

## 设计目标

Diff 只保留一套语义：Plate `@platejs/diff` 生成的 `insert`、`delete` 和 `update` 操作。

Editor 包负责：

- 计算 Plate Diff AST。
- 从同一份 AST 提取 `stats` 和 `hasChanges`。
- 在只读 Plate editor 中渲染 Diff AST。
- 提供不依赖 React、CSS 和 DOM 的 `./diff` 计算入口。

Editor 包不负责：

- revision 的查询、排序、恢复和去重。
- Web Worker、debounce、缓存和过期任务丢弃。
- Node codec 或 Elixir 端的 Diff 计算。
- 旧快照兼容、block ID 对齐、LIS、Myers 或自定义 LCS。

这些消费端能力应由 Groupher 根据实际交互和数据规模实现。

## 模块边界

```text
@groupher/rich-editor
├── RichEditor
├── RichEditorDiff              浏览器只读渲染组件
└── style.css

@groupher/rich-editor/diff
└── computeRichEditorDiff       Worker-safe 纯计算入口

@groupher/rich-editor/node
└── validate/canonicalize/Markdown/HTML/TOC/plain text
```

`./diff` 是浏览器和 Web Worker 能力，不代表 Node 业务层需要计算 Diff。它可以在 Node 环境导入，仅用于验证模块没有 React、CSS、`window` 或 `document` 依赖。

相关源码：

- [`src/diff.ts`](../src/diff.ts)：公开计算入口。
- [`src/diff/compute.ts`](../src/diff/compute.ts)：Plate Diff 调用与结果组装。
- [`src/diff/stats.ts`](../src/diff/stats.ts)：stats 和 `hasChanges` 提取。
- [`src/diff/types.ts`](../src/diff/types.ts)：Diff 领域类型。
- [`src/schema.ts`](../src/schema.ts)：浏览器 editor、Diff 和 Node codec 共用的 schema。
- [`src/RichEditor.tsx`](../src/RichEditor.tsx)：`RichEditorDiff` 渲染组件。

## 公开 API

计算函数从独立子入口导入：

```ts
import {
  computeRichEditorDiff,
  type TRichEditorDiffResult,
  type TRichEditorDiffStats,
  type TRichEditorDiffValue,
} from '@groupher/rich-editor/diff'
```

签名：

```ts
function computeRichEditorDiff(
  before: TRichEditorValue,
  after: TRichEditorValue,
): TRichEditorDiffResult

type TRichEditorDiffResult = Readonly<{
  diffValue: TRichEditorDiffValue
  hasChanges: boolean
  stats: TRichEditorDiffStats
}>

type TRichEditorDiffStats = Readonly<{
  additions: number
  deletions: number
}>

type TRichEditorDiffValue = Readonly<{
  kind: 'rich-editor-diff'
  nodes: TRichEditorValue
}>
```

`TRichEditorDiffValue` 是带有 `diffOperation` 的派生 AST，只用于渲染：

- 不要把它保存为正文。
- 不要传给普通 `RichEditor`。
- 不要提交给 revision restore 或 publish API。
- `Readonly` 和 `kind` 是 API 隔离，不代表节点已深度冻结。

## 基本使用

```tsx
import { RichEditorDiff } from '@groupher/rich-editor'
import { computeRichEditorDiff } from '@groupher/rich-editor/diff'
import '@groupher/rich-editor/style.css'

const result = computeRichEditorDiff(beforeValue, afterValue)

function RevisionDiff() {
  if (!result.hasChanges) return null

  return (
    <>
      <span>
        +{result.stats.additions} / -{result.stats.deletions}
      </span>

      <RichEditorDiff
        diffValue={result.diffValue}
        locale="zh-CN"
        mentionOptions={mentionOptions}
      />
    </>
  )
}
```

同一对文档应只调用一次 `computeRichEditorDiff()`。按钮、revision 列表和抽屉渲染都应复用同一个 result。

不要分别计算 stats 和渲染树：

```ts
// 不推荐：会重复执行完整 Diff
const stats = computeRichEditorDiff(before, after).stats
const diffValue = computeRichEditorDiff(before, after).diffValue
```

## `hasChanges` 与 stats

`hasChanges` 是判断文档是否发生变化的权威字段。不能使用下面的写法：

```ts
const hasChanges = stats.additions > 0 || stats.deletions > 0
```

Plate 的 `update`、空 block 和 void block 可能没有文本增删，但仍然是有效变化。

| 场景 | `hasChanges` | stats 语义 |
| --- | --- | --- |
| 文档完全相同 | `false` | `+0/-0` |
| 插入或删除文本 | `true` | 插入、删除的文本数量 |
| 文本替换 | `true` | 删除旧文本并插入新文本 |
| mark 或 block 属性更新 | `true` | 通常为 `+0/-0` |
| 新增空 paragraph 或 `hr` | `true` | `+0/-0` |
| 修改 link URL | `true` | Plate 可能表示为旧 link 删除、新 link 插入 |
| 修改空文本 mention | `true` | 可能为 `+0/-0` |
| block 换序 | `true` | 按删除加插入表示 |

stats 完全遵循 Plate 输出，不在产品层重新解释或修正操作类型。

### 字符计数单位

stats 使用 Unicode code point，而不是 JavaScript UTF-16 code unit：

```text
🙂 → 1
```

多个 code point 组成的 grapheme cluster，例如部分家庭 emoji，仍可能计为多个字符。这一规则稳定且不需要额外分词依赖。

## 统计遍历规则

Plate Diff 只执行一次，随后线性遍历 Diff AST：

- `insert`：设置 `hasChanges=true`，统计整个 subtree，然后停止向下递归。
- `delete`：设置 `hasChanges=true`，统计整个 subtree，然后停止向下递归。
- `update`：设置 `hasChanges=true`，继续递归 children。
- 没有任何 Diff operation：`hasChanges=false`。

在 `insert` 和 `delete` 节点停止递归，可以避免父节点和子文本同时带 operation 时重复计数。`update` 继续递归，可以保留节点属性更新内部的文本变化。

## Inline schema

Diff 计算使用共享 schema 中的 inline 类型：

```ts
export const RICH_EDITOR_INLINE_ELEMENT_TYPES = ['a', 'mention'] as const
```

调用 Plate 时会传入：

```ts
computeDiff(before, after, {
  isInline: isRichEditorInlineElement,
  lineBreakChar: '¶',
})
```

浏览器 editor、Node validator 和 Diff classifier 必须复用同一份 schema，避免 link 或 mention 在不同环境中获得不同的节点语义。

## RichEditorDiff renderer

`RichEditorDiff` 是纯渲染组件，不接收 `before` 和 `after`，也不会调用 `computeDiff`：

```tsx
<RichEditorDiff diffValue={result.diffValue} />
```

renderer Kit 的顶层组成是：

```text
PersistedEditorKit
+ DiffStylePlugin
```

它不会显式加载 Markdown、Emoji、Slash 或 MentionTransient Kit。需要注意，Plate 的 `MentionPlugin` 内部固定注册 `mention_input` 作为依赖；这是 Plate mention schema 的内部组成，不代表 Diff renderer 加载了 mention 搜索交互。

## Web Worker 使用建议

Plate Diff 可能在大文档上变慢，不应在每次键盘输入时同步计算完整文档。

Worker 示例：

```ts
// revision-diff.worker.ts
import { computeRichEditorDiff } from '@groupher/rich-editor/diff'

self.onmessage = ({ data }) => {
  const { requestId, before, after } = data
  const result = computeRichEditorDiff(before, after)

  self.postMessage({ requestId, result })
}
```

消费端建议：

1. 输入停止 150–250ms 后再提交任务。
2. 每个任务携带递增的 `requestId`。
3. 新输入到来后丢弃旧 request 的结果。
4. 使用 revision hash 或 snapshot key 缓存不可变历史结果。
5. 抽屉打开时复用已经计算好的 `diffValue`，不要重新计算。

完整 Diff AST 的 structured clone 也有成本。超大文档可以让 Worker 缓存 result，输入期间只返回 `stats`、`hasChanges` 和 cache key，抽屉打开后再取得 `diffValue`。这属于 Groupher 消费端设计，不在 editor 包中实现。

## 性能边界

当前调用模型：

```text
before + after
    ↓
一次 Plate computeDiff
    ↓
一次 O(Diff AST 节点数) 遍历
    ├── diffValue
    ├── stats
    └── hasChanges
```

这个设计消除了“stats 计算一次、renderer 再计算一次”的重复工作，但不会改变 Plate `computeDiff` 自身的最坏复杂度。大文档响应性需要通过 Worker、debounce、缓存和按需计算保证。

## 验证

Diff 行为和 package contract 由以下测试覆盖：

- [`tests/diff.test.ts`](../tests/diff.test.ts)：Plate operation、stats、`hasChanges`、inline schema、emoji、换序和输入不变性。
- [`tests/package-smoke.mjs`](../tests/package-smoke.mjs)：`./diff` export、Worker-safe 依赖边界和声明文件。
- [`tests/node-codec.test.ts`](../tests/node-codec.test.ts)：共享持久化 schema 与 Node codec。

本地验证命令：

```bash
npm test
npm run typecheck
npm run test:package
```

`test:package` 会完成完整构建、导入 smoke test，并通过 `npm pack --dry-run` 验证 `dist/diff.js` 和 `dist/diff.d.ts` 确实进入发布包。
