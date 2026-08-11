# Markdown Import

本文档说明如何通过 `@groupher/rich-editor/node` 把 Markdown 或文档平台的
Callout、Accordion、Code Group、Tabs、Steps 和结构化 Markdown 转换为 Groupher 使用的
canonical Plate JSON。

## 基本流程

```text
平台 Markdown/MDX
        ↓
platform compatibility normalizer
        ↓
Groupher portable elements
        ↓
Plate Markdown deserializer
        ↓
canonical Plate JSON + diagnostics
```

兼容层负责把平台专属容器转换为 Plate 可以稳定解析的 Markdown/MDX。普通
Markdown 仍由 Plate 解析；Mintlify 的 Card、Tooltip 和 metadata head 会在
反序列化前展开或移除，避免容器缩进被误判成代码块。Accordion、Tabs 和 Steps
不会降级为普通标题，而是分别进入通用的 `accordion_group`、`tabs` 和 `steps`
节点结构。

Plate 原生的 fenced code block 和 GFM table 会保留为 `code_block` / `code_line`
以及 `table` / `tr` / `td` / `th`，进入与浏览器编辑器一致的持久化 schema。
兼容层会先保护 fenced code block，因此代码示例中的厂商语法只作为代码保存，
不会被误转换成真实组件。

## 是否需要传 `source`

导入外部文档平台内容时需要传 `source`：

```ts
import { deserializeMarkdown } from '@groupher/rich-editor/node';

const result = deserializeMarkdown(markdown, {
  source: 'mintlify',
});
```

`source` 应由上层导入 adapter 根据连接器、仓库配置或导入任务类型自动传入，
不应要求最终用户阅读 Markdown 后手动选择平台。

当前没有自动探测平台语法。传错 `source` 时，对应平台的自定义 Callout 可能
保留为普通内容或无法被归一化。

省略 `source` 等价于使用 `groupher`：

```ts
const result = deserializeMarkdown(groupherMarkdown);

// 等价于
const result = deserializeMarkdown(groupherMarkdown, {
  source: 'groupher',
});
```

默认模式只承诺解析 Groupher portable Markdown，例如小写的
`<callout variant="info">...</callout>`、`<accordion_group>...</accordion_group>`、
`<tabs><tab label="..." value="...">...</tab></tabs>` 和
`<steps><step title="...">...</step></steps>`。PascalCase 的
`<AccordionGroup>/<Accordion>`、`<Steps>/<Step>` 以及 HTML
`<details>/<summary>` 属于跨平台、低歧义结构，因此不依赖具体 `source` 也会被
识别；其他厂商语法不会自动猜测。

## 支持的来源

```ts
type TRichEditorMarkdownSource =
  | 'docusaurus'
  | 'fumadocs'
  | 'gitbook'
  | 'github'
  | 'groupher'
  | 'mintlify'
  | 'mkdocs-material'
  | 'nextra'
  | 'rspress'
  | 'starlight'
  | 'vitepress';
```

| `source` | 当前识别的 Callout 语法 |
| --- | --- |
| `groupher` | `<callout variant="...">` |
| `mintlify` | `<Note>`、`<Info>`、`<Tip>`、`<Check>`、`<Warning>`、`<Danger>`、`<Callout>` |
| `nextra` | `<Callout type="...">` 和 GitHub Alert |
| `fumadocs` | `<Callout type="...">` |
| `docusaurus` | `:::note` 等 admonition container |
| `vitepress` | `::: info` 等 custom container、`::: details`、`:::code-group` |
| `rspress` | `:::note` 等 container 和 GitHub Alert |
| `starlight` | `:::note`、`:::tip`、`:::caution`、`:::danger` |
| `github` | `> [!NOTE]` 等 GitHub Alert |
| `mkdocs-material` | `!!! note` 等 admonition |
| `gitbook` | `{% hint style="..." %}` |

## 推荐的上层调用方式

文档来源通常在创建导入任务时已经确定。上层 adapter 应保存这个信息，并在
调用 Editor codec 时传入：

```ts
import {
  deserializeMarkdown,
  type TRichEditorMarkdownImportResult,
  type TRichEditorMarkdownSource,
} from '@groupher/rich-editor/node';

type DocumentImportInput = {
  markdown: string;
  source: TRichEditorMarkdownSource;
};

export function importDocument({
  markdown,
  source,
}: DocumentImportInput): TRichEditorMarkdownImportResult {
  return deserializeMarkdown(markdown, { source });
}
```

例如 Mintlify repository adapter 固定传 `mintlify`，GitBook adapter 固定传
`gitbook`。Rspress 和 Nextra 页面可以在同一文档中同时使用平台组件和 GitHub
Alert，上层仍然只需要传对应的平台 source。`github` 用于来源本身就是普通
GitHub Markdown 的场景。

## 返回值

```ts
type TRichEditorMarkdownImportResult = {
  value: TRichEditorCanonicalValue;
  diagnostics: TRichEditorMarkdownImportDiagnostic[];
};
```

使用转换后的 Plate JSON：

```ts
const { value, diagnostics } = deserializeMarkdown(markdown, {
  source: 'gitbook',
});

if (diagnostics.length > 0) {
  logger.warn({ diagnostics }, 'Markdown import completed with warnings');
}

await saveDocument(value);
```

`value` 已经过 canonicalize，可以直接进入现有 validator、持久化和静态导出
链路。`diagnostics` 当前用于报告无法无损保存的厂商属性：

```ts
type TRichEditorMarkdownImportDiagnostic = {
  code: 'unsupported_attribute';
  severity: 'warning';
  message: string;
  path: number[];
  attribute?: string;
};
```

`path` 指向转换完成后的 Plate 节点位置，而不是源文件中第几个 Callout。

## Callout AST

不同平台语法最终收敛为同一种 Plate 节点：

```json
{
  "type": "callout",
  "variant": "warning",
  "title": "Review required",
  "children": [{ "text": "Check the configuration before publishing." }]
}
```

当前 canonical variants：

```text
note / info / tip / success / warning / danger / important / custom
```

## Accordion AST

MDX Accordion 和连续的 HTML `<details>` 会收敛为同一个显式嵌套结构：

```text
accordion_group
└── accordion
    ├── accordion_title
    │   └── text
    └── accordion_content
        └── paragraph / callout / code_block / table / ...
```

`AccordionGroup` 直接映射为 `accordion_group`。单独的 `Accordion` 或
`<details>` 会自动补一个只包含该条目的隐式 group；连续的 `<details>` 会合并
到同一个 group。普通标题和段落不会被猜测为 Accordion。

Portable Markdown 使用小写节点名保存完整层级，浏览器和 Node/static 插件共用
同一套 schema。静态 HTML 使用原生 `<details>/<summary>` 输出。

VitePress 的 `::: details TITLE` 复用同一套 Accordion AST；缺省标题为
`Details`。

## Code Group AST

VitePress 的 `:::code-group` 会保留代码块标签和语言信息：

```text
code_group
└── code_group_item (label: "JS")
    └── code_block (lang: "js")
        └── code_line
```

`[JS]`、`[TS]` 等 fence 标签进入 `code_group_item.label`。浏览器和静态渲染器
使用原生 radio control 呈现可键盘切换的标签页；portable Markdown 使用小写
`<code_group>/<code_group_item>` 保持往返一致。

VitePress 的 `js{4}`、`ts{2-4}` 等行高亮 metadata 会拆分为正确的 `lang` 和
`highlightLines`，对应 `code_line` 同时带有 `highlighted: true`，不会再把
`js{4}` 当作语言名。

## Tabs AST

Fumadocs、Docusaurus、Nextra、Mintlify 和 Starlight 的 MDX Tabs 会收敛为同一
结构：

```text
tabs (defaultValue / orientation / syncTabKey / persist)
└── tab (label / value / icon / anchorId)
    └── paragraph / list / callout / code_block / table / ...
```

`tab.value` 是稳定身份；显示顺序直接由 `tabs.children` 的顺序决定，不额外持久化
`index`。编辑器中的拖拽和左右移动会重排 children，重命名不会改变 value。

`syncTabKey` 是可选的同步分组。只有 key 相同的 Tabs 才会广播和响应 active
value；没有 key 的 Tabs 保持本地状态。接收到当前组不存在的 value 时，该组维持
原选择。`persist` 支持 `none`、`session` 和 `local`，使用持久化时必须同时提供
`syncTabKey`。

兼容字段会按来源映射：

| `source` | 识别的 Tabs 结构 | 同步字段 |
| --- | --- | --- |
| `fumadocs` | `<Tabs items={...}>` / `<Tab>` | `groupId` |
| `docusaurus` | `<Tabs>` / `<TabItem>` | `groupId` |
| `nextra` | `<Tabs>` / `<Tabs.Tab>` | `storageKey` |
| `mintlify` | `<Tabs>` / `<Tab title="...">` | `sync` |
| `starlight` | `<Tabs>` / `<TabItem label="...">` | `syncKey` |

仅静态字符串、数字、数组和普通对象表达式会被读取；函数调用、变量引用等动态
表达式不会执行，并会产生 warning diagnostic。portable Markdown 统一输出小写
`<tabs>/<tab>`。React 静态渲染保留可切换的 ARIA Tabs；纯 Node HTML 会展开全部
panel，保证无 JavaScript 时仍可读取所有内容。

## Steps AST

Mintlify 的 `<Steps>/<Step>` 会收敛为四层语义结构：

```text
steps
└── step
    ├── step_title
    │   └── text
    └── step_content
        └── paragraph / list / callout / code_block / table / ...
```

`Step` 的 `title` 属性进入 `step_title`，块内容进入 `step_content`。列表、inline
code、Callout 等富文本块仍属于当前 Step，不会被提升到 Steps 外层；空的自闭合
Step 会获得一个空段落，使节点始终可编辑。

默认序号按 Step 顺序生成；`stepNumber` 可以覆盖单条显示序号。`Steps` 和 `Step`
上的其他 JSON-safe 属性会保留，源 `id` 会以 `anchorId` 持久化，避免被 canonical
过程当作临时 Slate id 清除；`noAnchor` 会禁止静态 HTML 输出锚点。

导入兼容 PascalCase `<Steps>/<Step>`，portable Markdown 统一输出小写
`<steps>/<step>`。静态 HTML 使用原生 `<ol>/<li>`，Step 标题是结构内标题而不是
文档 heading，因此不会进入 TOC。

## Lucide 图标

Plate 本身不提供命名图标库。Groupher 对已知厂商图标使用 Lucide 名称：

```json
{
  "type": "callout",
  "variant": "custom",
  "icon": "key",
  "iconLibrary": "lucide",
  "children": [{ "text": "Authentication is required." }]
}
```

当前示例映射包括：

```text
Mintlify key   → Lucide key
GitBook books → Lucide library-big
```

原生 emoji 直接保存在 `icon` 中，不设置 `iconLibrary`：

```json
{
  "icon": "⭐"
}
```

没有可靠 Lucide 对应项的厂商图标不会被猜测，会产生 warning diagnostic。
当前编辑器 UI 尚未根据 `iconLibrary: "lucide"` 渲染 Lucide 组件；这一字段先作为
稳定的数据协议保存。

## Fixture 与回归测试

平台语法、官方来源和 expected Plate JSON 记录在：

```text
tests/fixtures/markdown-compat/callout/
├── manifest.json
├── inputs/
└── expected/
```

Accordion 使用相同的 fixture contract：

```text
tests/fixtures/markdown-compat/accordion/
├── manifest.json
├── inputs/
└── expected/
```

Steps 的结构、富文本作用域、Markdown 往返、TOC 隔离和静态 HTML 输出当前由
`tests/markdown-import-structural-blocks.test.ts` 覆盖。

测试会遍历 manifest，并执行：

```text
input → deserializeMarkdown(input, { source }) → expected
```

新增平台语法或修改映射时，应先增加或修改 fixture，再更新 normalizer。
