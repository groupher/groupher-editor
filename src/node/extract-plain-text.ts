import { extractValueText } from '@/node/text';
import { assertValidValue } from '@/node/validate-value';

export const extractPlainText = (value: unknown): string =>
  extractValueText(assertValidValue(value));
