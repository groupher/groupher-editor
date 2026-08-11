# Markdown Extension Examples

## Syntax Highlighting

```js{2}
const first = true
const highlighted = true
```

:::code-group

```js [JS]
export default { language: "js" }
```

```ts [TS]
export default { language: "ts" }
```

:::

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::
```

**Output**

::: info TITLE
This is an info box.
:::

::: tip TITLE
This is a tip.
:::

::: warning TITLE
This is a warning.
:::

::: danger TITLE
This is a dangerous warning.
:::

::: details TITLE
This is a details block.
:::
