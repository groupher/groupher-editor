import type { TRichEditorCanonicalValue, TRichEditorJsonValue } from '@/node/types';
import { assertValidValue } from '@/node/validate-value';

const canonicalizeJson = (value: unknown): TRichEditorJsonValue | undefined => {
  if (value === undefined) return;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') return value;

  if (Array.isArray(value)) {
    return value
      .map(canonicalizeJson)
      .filter((item): item is TRichEditorJsonValue => item !== undefined);
  }

  const result: Record<string, TRichEditorJsonValue> = {};
  const record = value as Record<string, unknown>;

  Object.keys(record)
    .filter((key) => key !== '_id' && key !== 'id')
    .sort()
    .forEach((key) => {
      const item = canonicalizeJson(record[key]);
      if (item !== undefined) result[key] = item;
    });

  return result;
};

export const canonicalizeValue = (value: unknown): TRichEditorCanonicalValue => {
  const validValue = assertValidValue(value);
  return canonicalizeJson(validValue) as TRichEditorCanonicalValue;
};
