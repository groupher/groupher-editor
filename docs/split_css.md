# Viewer / Editor CSS 拆分

本文档定义 `@groupher/rich-editor` 的 CSS 公共边界，以及 Groupher 应用应如何按需加载这些样式。

## 结论

包只公开两个 CSS 入口：

```ts
import '@groupher/rich-editor/viewer.css';
import '@groupher/rich-editor/editor.css';
```

- `viewer.css` 服务于静态正文和只读 diff。
- `editor.css` 服务于真正出现的交互式编辑器，并通过内部 `@import` 包含 `viewer.css`。
- `style.css` 直接删除，不提供兼容入口；本次变更允许 breaking change。
- 包的 JavaScript 入口不隐式引入 CSS。由应用在明确的 route 或动态组件边界加载对应样式。

目标加载关系：

```text
普通页面 / 文章列表
        └── 不加载 rich-editor CSS

文章详情 / 静态预览 / revision diff
        └── viewer.css

编辑器真正出现
        └── editor.css
              └── @import "./viewer.css"
```

## 当前问题

当前 `RichEditor`、`RichEditorStatic` 和 `RichEditorDiff` 都直接引入 `src/global.css`。Vite library mode 默认不会拆分 CSS，配置又把 CSS 文件名固定为 `rich-editor`，因此多个 JavaScript 入口最终共享一份 `dist/rich-editor.css`。

现有 `global.css` 同时包含：

- 静态正文需要的 code block、code group、syntax highlight、steps 等展示规则；
- placeholder、quick actions 等编辑器交互规则；
- toolbar、dropdown、tooltip 等组件使用的 Tailwind utilities 和 animation；
- `:root`、`.dark`、`*`、`body` 等全局规则；
- `.row`、`.bold`、`.circle` 等通用名称的全局 utility。

这会产生两个问题：

1. 只渲染文章详情时也必须加载完整编辑器 CSS。
2. CSS 在应用根 layout 引入后，文章列表和其他普通页面也会承担下载、解析和全局样式污染成本。

仅把一个文件复制或重命名成 `viewer.css` 和 `editor.css` 不能解决问题。Tailwind v4 默认扫描整个项目；如果两个入口都直接使用 `@import "tailwindcss"`，它们可能生成两份接近完整的 utility 集合。

## 公共契约

`package.json` 的 CSS exports 应收敛为：

```json
{
  "exports": {
    "./viewer.css": "./dist/viewer.css",
    "./editor.css": "./dist/editor.css"
  }
}
```

同时删除：

- 顶层 `"style": "dist/rich-editor.css"`；
- `"./style.css"` export；
- `dist/rich-editor.css` 产物；
- `RichEditor.tsx`、`RichEditorStatic.tsx` 和 `RichEditorDiff.tsx` 对 `global.css` 的副作用 import。

不保留 `style.css -> editor.css` alias。消费端必须明确声明自己需要 viewer 还是 editor，避免新代码继续沿用含义不清的完整样式入口。

## 样式所有权

### `viewer.css`

`viewer.css` 只包含持久化文档在只读状态下正确展示所需的样式：

- paragraph、heading、blockquote、list；
- link、mention、inline code；
- callout、toggle、accordion；
- table；
- tabs；
- steps；
- code block、code group、line highlight、syntax token；
- 静态正文内确实需要的响应式规则；
- diff viewer 的 addition、deletion 等只读呈现规则。

判断标准是：同一份持久化 `TRichEditorValue` 经 `RichEditorStatic` 或 `RichEditorDiff` 输出后，是否需要该规则才能正确阅读。与光标、selection、编辑命令、浮层或输入反馈有关的规则不属于 viewer。

### `editor.css`

`editor.css` 首先引入 viewer：

```css
@import "./viewer.css";
```

然后只增加编辑态能力：

- editable surface、selection、caret；
- placeholder；
- floating / fixed toolbar；
- block action rail 和 quick actions；
- slash command；
- mention / emoji combobox；
- dropdown、popover、tooltip；
- drag handle、编辑态按钮和 focus 状态；
- editor-only scrollbar 和 animation；
- debug mode 的编辑器面板。

`editor.css` 是完整编辑器入口。只使用编辑器的页面不需要再手动 import `viewer.css`；已经加载过 viewer 的文章详情进入编辑态时，也可以复用已加载或已缓存的 viewer 部分。

## 作用域

拆分时必须同时建立稳定根节点，避免包样式泄漏到宿主应用：

```text
.rich-editor-root
├── .rich-editor-viewer
└── .rich-editor-editor
```

- `RichEditorStatic` 和 `RichEditorDiff` 的根节点始终带 `.rich-editor-root.rich-editor-viewer`。
- `RichEditor` 的根节点始终带 `.rich-editor-root.rich-editor-editor`。
- consumer 传入的 `className` 只能追加，不能替代这些稳定 class。
- rich-editor 私有 tokens 优先挂在 `.rich-editor-root` 及其 `.dark` 后代语义下，不写入无作用域的 `:root`。
- 删除包内针对 `body` 和全局 `*` 的 base 修改；页面背景、前景色和 reset 属于宿主应用。
- `.row`、`.bold`、`.circle` 等通用 utility 不应继续作为包的公共全局 class。组件应改用 Tailwind 原子类，或者使用带 `rich-editor-` 前缀且有明确语义的 class。

即使应用通过客户端导航访问过编辑器，CSS 留在当前页面生命周期中，也不会影响根节点以外的 UI。

## Tailwind source 边界

两个 CSS 入口都应关闭自动扫描，再显式登记各自的源码范围：

```css
@import "tailwindcss" source(none);
```

随后分别使用 `@source` 指向 viewer 和 editor 的组件集合。不要让两个入口默认扫描整个 `src`。

viewer source 至少覆盖：

- `RichEditorStatic`、`RichEditorDiff` 及其内容组件；
- static/base kits；
- static node renderers；
- viewer 与 editor 共用的持久化 block renderers；
- tabs sync 等只读交互组件。

editor source 覆盖：

- `RichEditor`；
- interactive editor kits；
- editable node renderers；
- toolbar、combobox、popover、slash、emoji、quick actions 等编辑器 UI。

不要长期维护一组难以审计的零散文件清单。如果现有目录无法稳定表达这两个集合，应先把组件整理为明确的 `viewer/shared` 与 `editor` 目录边界，再让 `@source` 对准目录。新增 block 时，其 static renderer 和交互 renderer 必须分别进入对应 source 范围。

## 构建边界

CSS 应作为两个明确的构建入口产出，而不是依赖三个 JavaScript library entry 自动汇总 CSS。

构建结果必须满足：

```text
dist/
├── viewer.css
├── editor.css
├── rich-editor.js
├── static.js
├── diff-viewer.js
├── node.js
└── diff.js
```

`cssCodeSplit: true` 只能决定 Vite 是否输出多个 CSS chunk，不能代替 Tailwind source 隔离。最终文件名和依赖关系必须是稳定公共契约，不能暴露带 hash 的内部 CSS chunk 名称。

`@groupher/rich-editor/node` 和 `@groupher/rich-editor/diff` 继续保持 headless：不能 import browser CSS、React editor UI 或 DOM runtime。

## Groupher 消费边界

### Main

- 从 `frontend/main/src/app/layout.tsx` 删除 rich-editor CSS。
- 文章详情对应的 route layout、page 或 app-local wrapper 引入 `viewer.css`。
- 文章列表、首页和其他普通页面不引入任何 rich-editor CSS。
- 如果某个列表卡片未来渲染完整的持久化 rich content，而不是纯文本摘要，则该 route 才升级为 viewer consumer。

### Dashboard

- 从 `frontend/dashboard/src/app/layout.tsx` 删除 rich-editor CSS。
- Docs 编辑器 route 或真正承载动态编辑器的 app-local wrapper 引入 `editor.css`。
- revision diff 只需要 `viewer.css`；若它与编辑器位于同一路由，`editor.css` 已经包含 viewer，不需要重复声明。
- 仅 import `TRichEditorValue`、codec 或 diff compute 类型/函数的页面不应加载 CSS。

Next App Router 会在生产构建中按 route/module graph 切分 CSS，但全局 stylesheet 在客户端导航后不会保证卸载。因此这里的“按需加载”定义为：首次访问普通页面时不下载；进入文章详情或真正显示编辑器时才下载相应 CSS。正确的根节点作用域仍是必要条件。

## 验收标准

### Package surface

- `npm run test:package` 通过。
- `npm pack --dry-run` 中包含 `dist/viewer.css` 和 `dist/editor.css`。
- tarball 中不存在 `dist/rich-editor.css`。
- exports 中存在且只存在新的两个 CSS 子路径。
- `@groupher/rich-editor/node` 与 `@groupher/rich-editor/diff` 构建产物不含 CSS import。

### Viewer correctness

- 只加载 `viewer.css` 时，现有 block fixtures 的静态 SSR 输出显示正确。
- tabs、accordion、toggle、steps、code group 和 syntax highlight 可读且交互正常。
- diff viewer 的新增、删除和布局标记正常。
- 页面 body、普通 button、宿主 `.row` 等根节点外元素不受 viewer CSS 影响。

### Editor correctness

- 只加载 `editor.css` 即可完整使用编辑器，不要求 consumer 再显式加载 viewer。
- toolbar、slash、mention、emoji、quick actions、code language select 和所有 popover 正常。
- 编辑器内静态 block 的视觉结果与 viewer 一致。
- dark mode 和宿主主题变量继续正确生效。

### Application bundles

对 Main 和 Dashboard 执行 production build，并检查最终 route CSS：

| 页面 | 允许加载的 rich-editor CSS |
| --- | --- |
| 首页、文章列表、普通设置页 | 无 |
| 文章详情、静态预览、只读 diff | `viewer.css` |
| 编辑器 | `editor.css`，以及它声明的 viewer 依赖 |

最后通过浏览器验证首次直达、客户端导航和动态打开编辑器三条路径，避免 CSS 迟到造成正文或编辑器闪烁。
