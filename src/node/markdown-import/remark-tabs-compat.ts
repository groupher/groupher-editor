import type {
  DeserializeMdOptions,
  MdMdxJsxFlowElement,
  MdMdxJsxTextElement,
  MdRoot,
} from '@platejs/markdown';

import type {
  TRichEditorMarkdownImportDiagnostic,
  TRichEditorMarkdownSource,
} from '@/node/types';
import {
  createUniqueTabValue,
  parseTabIconInput,
  slugifyTabValue,
  type TTabIcon,
  type TTabsPersist,
} from '@/tabs';

type TRemarkPlugin = NonNullable<
  DeserializeMdOptions['remarkPlugins']
>[number];
type TMdxElement = MdMdxJsxFlowElement | MdMdxJsxTextElement;
type TMdxAttribute = MdMdxJsxFlowElement['attributes'][number];
type TMdNode = {
  type: string;
  children?: TMdNode[];
  value?: string;
  [key: string]: unknown;
};
type TTabsImportContext = {
  diagnostics: TRichEditorMarkdownImportDiagnostic[];
  source: TRichEditorMarkdownSource;
};

const UNSUPPORTED = Symbol('unsupported');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const expressionFromEstree = (value: unknown): unknown | typeof UNSUPPORTED => {
  if (!isRecord(value)) return UNSUPPORTED;

  if (value.type === 'Program') {
    if (!Array.isArray(value.body) || value.body.length !== 1) {
      return UNSUPPORTED;
    }

    return expressionFromEstree(value.body[0]);
  }

  if (value.type === 'ExpressionStatement') {
    return expressionFromEstree(value.expression);
  }

  if (value.type === 'Literal') {
    const literal = value.value;

    return literal === null ||
      typeof literal === 'boolean' ||
      typeof literal === 'number' ||
      typeof literal === 'string'
      ? literal
      : UNSUPPORTED;
  }

  if (value.type === 'UnaryExpression') {
    const argument = expressionFromEstree(value.argument);
    if (typeof argument !== 'number') return UNSUPPORTED;
    if (value.operator === '-') return -argument;
    if (value.operator === '+') return argument;

    return UNSUPPORTED;
  }

  if (value.type === 'ArrayExpression') {
    if (!Array.isArray(value.elements)) return UNSUPPORTED;

    const result: unknown[] = [];
    for (const element of value.elements) {
      const item = expressionFromEstree(element);
      if (item === UNSUPPORTED) return UNSUPPORTED;
      result.push(item);
    }

    return result;
  }

  if (value.type === 'ObjectExpression') {
    if (!Array.isArray(value.properties)) return UNSUPPORTED;

    const result: Record<string, unknown> = Object.create(null);
    for (const property of value.properties) {
      if (
        !isRecord(property) ||
        property.type !== 'Property' ||
        property.kind !== 'init' ||
        property.computed === true ||
        property.method === true
      ) {
        return UNSUPPORTED;
      }

      const keyNode = property.key;
      const key =
        isRecord(keyNode) && keyNode.type === 'Identifier'
          ? keyNode.name
          : isRecord(keyNode) && keyNode.type === 'Literal'
            ? keyNode.value
            : undefined;
      if (
        typeof key !== 'string' ||
        key === '__proto__' ||
        key === 'constructor' ||
        key === 'prototype'
      ) {
        return UNSUPPORTED;
      }

      const item = expressionFromEstree(property.value);
      if (item === UNSUPPORTED) return UNSUPPORTED;
      result[key] = item;
    }

    return result;
  }

  return UNSUPPORTED;
};

const expressionAttributeValue = (
  value: Record<string, unknown>
): unknown | typeof UNSUPPORTED => {
  const estree = isRecord(value.data) ? value.data.estree : undefined;
  const parsed = expressionFromEstree(estree);
  if (parsed !== UNSUPPORTED) return parsed;

  if (typeof value.value !== 'string') return UNSUPPORTED;
  try {
    return JSON.parse(value.value);
  } catch {
    return UNSUPPORTED;
  }
};

const getAttribute = (
  element: TMdxElement,
  name: string
): { present: boolean; value: unknown | typeof UNSUPPORTED } => {
  const attribute = element.attributes.find(
    (item): item is Extract<TMdxAttribute, { name: string }> =>
      'name' in item && item.name === name
  );
  if (!attribute) return { present: false, value: undefined };
  if (attribute.value === null || attribute.value === undefined) {
    return { present: true, value: true };
  }
  if (typeof attribute.value === 'string') {
    return { present: true, value: attribute.value };
  }
  if (isRecord(attribute.value)) {
    return {
      present: true,
      value: expressionAttributeValue(attribute.value),
    };
  }

  return { present: true, value: UNSUPPORTED };
};

const mdxAttribute = (name: string, value: boolean | number | string) => ({
  name,
  type: 'mdxJsxAttribute' as const,
  value:
    typeof value === 'string'
      ? value
      : value === true
        ? null
        : {
            type: 'mdxJsxAttributeValueExpression' as const,
            value: String(value),
          },
});

const mdxExpressionAttribute = (name: string, value: unknown) => ({
  name,
  type: 'mdxJsxAttribute' as const,
  value: {
    type: 'mdxJsxAttributeValueExpression' as const,
    value: JSON.stringify(value),
  },
});

const warn = (
  context: TTabsImportContext,
  attribute: string,
  message: string
) => {
  context.diagnostics.push({
    attribute,
    code: 'unsupported_attribute',
    message,
    path: [],
    severity: 'warning',
  });
};

const isMdxElement = (node: TMdNode): node is TMdNode & TMdxElement =>
  (node.type === 'mdxJsxFlowElement' ||
    node.type === 'mdxJsxTextElement') &&
  typeof node.name === 'string' &&
  Array.isArray(node.attributes) &&
  Array.isArray(node.children);

const sourceNames = (
  source: TRichEditorMarkdownSource
): { groups: Set<string>; items: Set<string> } => {
  const groups = new Set(['tabs']);
  const items = new Set(['tab']);

  if (
    source === 'docusaurus' ||
    source === 'fumadocs' ||
    source === 'mintlify' ||
    source === 'nextra' ||
    source === 'starlight'
  ) {
    groups.add('Tabs');
  }
  if (source === 'fumadocs' || source === 'mintlify' || source === 'nextra') {
    items.add('Tab');
  }
  if (source === 'docusaurus' || source === 'starlight') {
    items.add('TabItem');
  }
  if (source === 'nextra') items.add('Tabs.Tab');

  return { groups, items };
};

const extractTabItems = (
  group: TMdxElement,
  itemNames: Set<string>
): TMdxElement[] | undefined => {
  const items: TMdxElement[] = [];

  for (const child of group.children as unknown as TMdNode[]) {
    if (isMdxElement(child) && itemNames.has(child.name ?? '')) {
      items.push(child);
      continue;
    }

    if (child.type === 'text' && !child.value?.trim()) continue;

    if (child.type === 'paragraph' && Array.isArray(child.children)) {
      let validWrapper = true;
      for (const paragraphChild of child.children) {
        if (
          isMdxElement(paragraphChild) &&
          itemNames.has(paragraphChild.name ?? '')
        ) {
          items.push(paragraphChild);
        } else if (
          paragraphChild.type !== 'text' ||
          paragraphChild.value?.trim()
        ) {
          validWrapper = false;
          break;
        }
      }
      if (validWrapper) continue;
    }

    return;
  }

  return items.length > 0 ? items : undefined;
};

const staticArray = (
  element: TMdxElement,
  name: string,
  context: TTabsImportContext
): unknown[] | undefined => {
  const attribute = getAttribute(element, name);
  if (!attribute.present) return;
  if (Array.isArray(attribute.value)) return attribute.value;

  warn(
    context,
    name,
    `${context.source} Tabs ${name} must be a static array to be imported.`
  );
};

const staticString = (
  element: TMdxElement,
  name: string,
  context?: TTabsImportContext
): string | undefined => {
  const attribute = getAttribute(element, name);
  if (!attribute.present) return;
  if (typeof attribute.value === 'string' && attribute.value.trim()) {
    return attribute.value.trim();
  }

  if (context && attribute.value === UNSUPPORTED) {
    warn(
      context,
      name,
      `${context.source} Tabs ${name} must be a static string to be imported.`
    );
  }
};

const staticNumber = (
  element: TMdxElement,
  name: string,
  context: TTabsImportContext
): number | undefined => {
  const attribute = getAttribute(element, name);
  if (!attribute.present) return;
  if (
    typeof attribute.value === 'number' &&
    Number.isInteger(attribute.value)
  ) {
    return attribute.value;
  }

  warn(
    context,
    name,
    `${context.source} Tabs ${name} must be a static integer to be imported.`
  );
};

const tabIcon = (
  item: TMdxElement,
  context: TTabsImportContext
): TTabIcon | undefined => {
  const attribute = getAttribute(item, 'icon');
  if (!attribute.present) return;

  if (isRecord(attribute.value)) {
    const type = attribute.value.type;
    if (
      type === 'lucide' &&
      typeof attribute.value.name === 'string' &&
      attribute.value.name.trim()
    ) {
      return {
        name: attribute.value.name.trim(),
        type,
      };
    }
    if (
      type === 'image' &&
      typeof attribute.value.src === 'string' &&
      attribute.value.src.trim()
    ) {
      return {
        src: attribute.value.src.trim(),
        type,
      };
    }
    if (
      type === 'vendor' &&
      (attribute.value.library === 'fontawesome' ||
        attribute.value.library === 'mintlify' ||
        attribute.value.library === 'starlight') &&
      typeof attribute.value.name === 'string' &&
      attribute.value.name.trim()
    ) {
      return {
        library: attribute.value.library,
        name: attribute.value.name.trim(),
        type,
        ...(typeof attribute.value.variant === 'string'
          ? { variant: attribute.value.variant }
          : {}),
      };
    }
  }

  if (typeof attribute.value === 'string') {
    const value = attribute.value.trim();
    if (/^(?:https?:\/\/|\/|\.{1,2}\/)/.test(value)) {
      return { src: value, type: 'image' };
    }
    if (context.source === 'starlight') {
      return { library: 'starlight', name: value, type: 'vendor' };
    }
    if (context.source === 'mintlify') {
      const variant = staticString(item, 'iconType');

      return {
        library: variant ? 'fontawesome' : 'mintlify',
        name: value,
        type: 'vendor',
        ...(variant ? { variant } : {}),
      };
    }

    return parseTabIconInput(value);
  }

  warn(
    context,
    'icon',
    `${context.source} Tab icon must be static to be imported.`
  );
};

const contentChildren = (item: TMdxElement): TMdNode[] => {
  const children = item.children as unknown as TMdNode[];
  if (children.length === 0) {
    return [{ children: [{ type: 'text', value: '' }], type: 'paragraph' }];
  }
  if (item.type === 'mdxJsxTextElement') {
    return [{ children, type: 'paragraph' }];
  }

  return children;
};

const parentItemData = (
  source: TRichEditorMarkdownSource,
  parentItems: unknown[] | undefined,
  parentValues: unknown[] | undefined,
  childValue: string | undefined,
  index: number
): { label?: string; value?: string } => {
  if (source === 'docusaurus' && parentValues) {
    const matching = parentValues.find(
      (item) =>
        isRecord(item) &&
        typeof item.value === 'string' &&
        item.value === childValue
    );
    const item = isRecord(matching)
      ? matching
      : isRecord(parentValues[index])
        ? parentValues[index]
        : undefined;

    return {
      label: typeof item?.label === 'string' ? item.label : undefined,
      value: typeof item?.value === 'string' ? item.value : undefined,
    };
  }

  const item = parentItems?.[index];
  if (typeof item === 'string') return { label: item };
  if (isRecord(item)) {
    return {
      label: typeof item.label === 'string' ? item.label : undefined,
      value: typeof item.value === 'string' ? item.value : undefined,
    };
  }

  return {};
};

const normalizedGroupProperties = (
  group: TMdxElement,
  context: TTabsImportContext,
  values: string[],
  childDefaultValue: string | undefined
) => {
  const { source } = context;
  const canonicalSyncKey = staticString(group, 'syncTabKey', context);
  let syncTabKey = canonicalSyncKey;
  let persist = staticString(group, 'persist') as TTabsPersist | undefined;

  if (source === 'fumadocs' || source === 'docusaurus') {
    syncTabKey = staticString(group, 'groupId', context) ?? syncTabKey;
    if (syncTabKey) {
      const persistent = getAttribute(group, 'persist').value === true;
      persist =
        source === 'docusaurus' || persistent ? 'local' : 'session';
    }
  } else if (source === 'nextra') {
    syncTabKey = staticString(group, 'storageKey', context) ?? syncTabKey;
    if (syncTabKey) persist = 'local';
  } else if (source === 'starlight') {
    syncTabKey = staticString(group, 'syncKey', context) ?? syncTabKey;
    if (syncTabKey) persist = 'local';
  } else if (source === 'mintlify') {
    const sync = getAttribute(group, 'sync');
    if (!sync.present || sync.value !== false) {
      syncTabKey = 'mintlify:tabs';
      persist = 'local';
    }
  }

  let defaultValue =
    staticString(group, 'defaultValue', context) ?? childDefaultValue;
  const defaultIndex =
    staticNumber(group, 'defaultIndex', context) ??
    staticNumber(group, 'defaultTabIndex', context);
  if (!defaultValue && defaultIndex !== undefined) {
    defaultValue = values[defaultIndex];
    if (!defaultValue) {
      warn(
        context,
        'defaultIndex',
        `${source} Tabs default index is outside the imported tab range.`
      );
    }
  }
  if (!defaultValue || !values.includes(defaultValue)) {
    if (defaultValue) {
      warn(
        context,
        'defaultValue',
        `${source} Tabs defaultValue does not match an imported tab.`
      );
    }
    defaultValue = values[0];
  }

  const orientation = staticString(group, 'orientation');

  return {
    defaultValue,
    ...(orientation === 'vertical' ? { orientation } : {}),
    ...(persist === 'local' || persist === 'session' ? { persist } : {}),
    ...(syncTabKey ? { syncTabKey } : {}),
  };
};

const normalizeTabsElement = (
  group: TMdxElement,
  context: TTabsImportContext,
  itemNames: Set<string>
): boolean => {
  const items = extractTabItems(group, itemNames);
  if (!items) return false;

  const parentItems = staticArray(group, 'items', context);
  const parentValues = staticArray(group, 'values', context);
  const values: string[] = [];
  let childDefaultValue: string | undefined;

  const normalizedItems = items.map((item, index) => {
    const childValue = staticString(item, 'value', context);
    const parentData = parentItemData(
      context.source,
      parentItems,
      parentValues,
      childValue,
      index
    );
    const labelAttribute =
      context.source === 'mintlify'
        ? staticString(item, 'title', context)
        : staticString(item, 'label', context);
    const label =
      parentData.label?.trim() ||
      labelAttribute ||
      childValue ||
      `Tab ${index + 1}`;
    const preferredValue =
      parentData.value?.trim() || childValue || slugifyTabValue(label);
    const value = createUniqueTabValue(preferredValue, values);
    values.push(value);

    if (getAttribute(item, 'default').value === true) {
      childDefaultValue = value;
    }

    const anchorId = staticString(item, 'id', context);
    const icon = tabIcon(item, context);
    const attributes = [
      mdxAttribute('value', value),
      mdxAttribute('label', label),
      ...(anchorId ? [mdxAttribute('id', anchorId)] : []),
      ...(icon ? [mdxExpressionAttribute('icon', icon)] : []),
    ];

    return {
      ...item,
      attributes,
      children: contentChildren(item),
      name: 'tab',
      type: 'mdxJsxFlowElement',
    } as MdMdxJsxFlowElement;
  });

  const properties = normalizedGroupProperties(
    group,
    context,
    values,
    childDefaultValue
  );
  group.type = 'mdxJsxFlowElement';
  group.name = 'tabs';
  group.children = normalizedItems;
  group.attributes = [
    mdxAttribute('defaultValue', properties.defaultValue),
    ...(properties.syncTabKey
      ? [mdxAttribute('syncTabKey', properties.syncTabKey)]
      : []),
    ...(properties.persist
      ? [mdxAttribute('persist', properties.persist)]
      : []),
    ...(properties.orientation
      ? [mdxAttribute('orientation', properties.orientation)]
      : []),
  ];

  return true;
};

const normalizeChildren = (
  node: TMdNode,
  context: TTabsImportContext,
  names: ReturnType<typeof sourceNames>
) => {
  if (!Array.isArray(node.children)) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === 'paragraph' && Array.isArray(child.children)) {
      const meaningfulChildren = child.children.filter(
        (paragraphChild) =>
          paragraphChild.type !== 'text' || paragraphChild.value?.trim()
      );
      const group = meaningfulChildren[0];
      if (
        meaningfulChildren.length === 1 &&
        group &&
        isMdxElement(group) &&
        names.groups.has(group.name ?? '') &&
        normalizeTabsElement(group, context, names.items)
      ) {
        group.children.forEach((item) =>
          normalizeChildren(item as unknown as TMdNode, context, names)
        );

        return [group as unknown as TMdNode];
      }
    }

    if (
      isMdxElement(child) &&
      names.groups.has(child.name ?? '') &&
      normalizeTabsElement(child, context, names.items)
    ) {
      child.children.forEach((item) =>
        normalizeChildren(item as unknown as TMdNode, context, names)
      );
      return [child];
    }

    normalizeChildren(child, context, names);

    return [child];
  });
};

export const createRemarkTabsPlugin = (
  context: TTabsImportContext
): TRemarkPlugin =>
  function remarkTabsCompatibility() {
    return (tree: MdRoot) => {
      normalizeChildren(
        tree as unknown as TMdNode,
        context,
        sourceNames(context.source)
      );
    };
  };
