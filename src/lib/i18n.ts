export type Locale = 'zh' | 'en';

export const messages = {
  zh: {
    editorTitle: '编辑器示例',
    language: '语言',
    selectionToolbar: {
      bold: '加粗',
      italic: '斜体',
      underline: '下划线',
      strikethrough: '删除线',
      link: '链接',
    },
    slash: {
      placeholder: '输入 / 以插入区块',
      empty: '没有匹配的命令',
      groups: {
        basic: '常用区块',
      },
      items: {
        h1: '标题 1',
        h2: '标题 2',
        h3: '标题 3',
        bulleted: '无序列表',
        numbered: '有序列表',
        todo: '待办列表',
        toggle: '折叠块',
        callout: '提示块',
        blockquote: '引用',
      },
    },
    mention: {
      title: '提及',
      empty: '没有匹配的成员',
    },
    export: {
      title: '导出 / 只读还原',
      exportButton: '导出 JSON',
      renderButton: '从 JSON 只读还原',
      placeholder: '导出的 JSON 会出现在这里…',
      error: 'JSON 解析失败，请检查格式。',
    },
    placeholder: '输入内容，使用 / 弹出命令…',
  },
  en: {
    editorTitle: 'Editor Demo',
    language: 'Language',
    selectionToolbar: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      link: 'Link',
    },
    slash: {
      placeholder: 'Type / to insert blocks',
      empty: 'No matching commands',
      groups: {
        basic: 'Common blocks',
      },
      items: {
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        bulleted: 'Bulleted list',
        numbered: 'Numbered list',
        todo: 'Todo list',
        toggle: 'Toggle',
        callout: 'Callout',
        blockquote: 'Blockquote',
      },
    },
    mention: {
      title: 'Mentions',
      empty: 'No matching people',
    },
    export: {
      title: 'Export / Read-only restore',
      exportButton: 'Export JSON',
      renderButton: 'Render JSON in read-only',
      placeholder: 'Exported JSON will appear here…',
      error: 'Failed to parse JSON. Please check the format.',
    },
    placeholder: 'Type content and use / for commands…',
  },
} as const;

export const getMessages = (locale: Locale) => messages[locale];
