import type { Value } from 'platejs';

export const FULL_VALUE = [
  {
    type: 'h1',
    children: [{ text: '发布流程' }],
  },
  {
    _id: 'legacy-id',
    id: 'paragraph-id',
    type: 'p',
    children: [
      { text: 'Marks: ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { code: true, text: 'code' },
      { text: ', ' },
      { strikethrough: true, text: 'strike' },
      { text: ', ' },
      { subscript: true, text: 'sub' },
      { text: ', ' },
      { superscript: true, text: 'sup' },
      { text: ', ' },
      { highlight: true, text: 'highlight' },
      { text: ', ' },
      { kbd: true, text: 'kbd' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Visit ' },
      {
        type: 'a',
        children: [{ text: 'Groupher' }],
        target: '_blank',
        url: 'https://groupher.com',
      },
      { text: ' with ' },
      {
        type: 'mention',
        children: [{ text: '' }],
        key: 'u-1',
        value: 'Alice',
      },
      { text: '.' },
    ],
  },
  {
    type: 'callout',
    children: [{ text: 'Important note.' }],
    icon: '💡',
    variant: 'info',
  },
  {
    type: 'toggle',
    children: [{ text: 'Toggle details.' }],
    collapsed: false,
  },
  {
    type: 'blockquote',
    children: [{ text: 'Quoted text.' }],
  },
  {
    type: 'hr',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Bullet item.' }],
    indent: 1,
    listStyleType: 'disc',
  },
  {
    type: 'p',
    children: [{ text: 'Numbered item.' }],
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
  },
  {
    type: 'p',
    checked: true,
    children: [{ text: 'Finished task.' }],
    indent: 1,
    listStyleType: 'todo',
  },
  {
    type: 'h2',
    children: [{ text: '发布流程' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Heading Three' }],
  },
  {
    id: 'custom-heading',
    type: 'h4',
    children: [{ text: 'Heading Four' }],
  },
  {
    type: 'h5',
    children: [{ text: 'Heading Five' }],
  },
  {
    type: 'h6',
    children: [{ text: 'Heading Six' }],
  },
] satisfies Value;

export const FULL_VALUE_MARKDOWN = `# 发布流程

Marks: **bold**, _italic_, <u>underline</u>, \`code\`, ~~strike~~, <sub>sub</sub>, <sup>sup</sup>, <mark>highlight</mark>, <kbd>kbd</kbd>

Visit [Groupher](https://groupher.com) with [Alice](mention:u-1).

<callout icon="💡" variant="info">
  Important note.
</callout>

<toggle collapsed="false">
  Toggle details.
</toggle>

> Quoted text.

***

* Bullet item.

3. Numbered item.

* [x] Finished task.

## 发布流程

### Heading Three

#### Heading Four

##### Heading Five

###### Heading Six
`;

export const FULL_VALUE_PLAIN_TEXT = `发布流程
Marks: bold, italic, underline, code, strike, sub, sup, highlight, kbd
Visit Groupher with @Alice.
Important note.
Toggle details.
Quoted text.

Bullet item.
Numbered item.
Finished task.
发布流程
Heading Three
Heading Four
Heading Five
Heading Six`;
