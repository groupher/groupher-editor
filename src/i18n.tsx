import * as React from 'react';

export type TLocale = 'en' | 'zh-CN';

type TI18nStrings = {
  locale: TLocale;
  placeholder: string;
  toolbar: {
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    link: string;
  };
  slash: {
    empty: string;
    groups: {
      blocks: string;
      lists: string;
    };
    items: {
      paragraph: string;
      heading1: string;
      heading2: string;
      heading3: string;
      bulletedList: string;
      numberedList: string;
      todoList: string;
      toggle: string;
      callout: string;
      blockquote: string;
    };
  };
  mention: {
    empty: string;
    label: string;
  };
  export: {
    title: string;
    button: string;
    placeholder: string;
    loadButton: string;
    readonlyTitle: string;
    invalidJson: string;
  };
};

const translations: Record<TLocale, TI18nStrings> = {
  en: {
    locale: 'en',
    placeholder: 'Type your content here...',
    toolbar: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      link: 'Link',
    },
    slash: {
      empty: 'No results',
      groups: {
        blocks: 'Blocks',
        lists: 'Lists',
      },
      items: {
        paragraph: 'Text',
        heading1: 'Heading 1',
        heading2: 'Heading 2',
        heading3: 'Heading 3',
        bulletedList: 'Bulleted list',
        numberedList: 'Numbered list',
        todoList: 'To-do list',
        toggle: 'Toggle',
        callout: 'Callout',
        blockquote: 'Blockquote',
      },
    },
    mention: {
      empty: 'No matches',
      label: 'Mention',
    },
    export: {
      title: 'Export JSON',
      button: 'Export',
      placeholder: 'Paste exported JSON here to preview read-only.',
      loadButton: 'Render Read-only',
      readonlyTitle: 'Read-only Preview',
      invalidJson: 'Invalid JSON, please check formatting.',
    },
  },
  'zh-CN': {
    locale: 'zh-CN',
    placeholder: '输入内容…',
    toolbar: {
      bold: '加粗',
      italic: '斜体',
      underline: '下划线',
      strikethrough: '删除线',
      link: '链接',
    },
    slash: {
      empty: '没有匹配结果',
      groups: {
        blocks: '块级',
        lists: '列表',
      },
      items: {
        paragraph: '文本',
        heading1: '标题 1',
        heading2: '标题 2',
        heading3: '标题 3',
        bulletedList: '无序列表',
        numberedList: '有序列表',
        todoList: '待办列表',
        toggle: '折叠',
        callout: '提示块',
        blockquote: '引用',
      },
    },
    mention: {
      empty: '没有匹配用户',
      label: '提及',
    },
    export: {
      title: '导出 JSON',
      button: '导出',
      placeholder: '粘贴导出的 JSON 以预览只读内容。',
      loadButton: '渲染只读',
      readonlyTitle: '只读预览',
      invalidJson: 'JSON 格式错误，请检查。',
    },
  },
};

export const defaultLocale: TLocale = 'zh-CN';

const I18nContext = React.createContext<TI18nStrings>(
  translations[defaultLocale]
);

export function I18nProvider({
  children,
  locale = defaultLocale,
}: {
  children: React.ReactNode;
  locale?: TLocale;
}) {
  const value = translations[locale] ?? translations[defaultLocale];

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return React.useContext(I18nContext);
}
