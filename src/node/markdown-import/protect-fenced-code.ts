type TProtectedFence = {
  lines: string[];
};

type TProtectedMarkdown = {
  markdown: string;
  restore: (value: string) => string;
};

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,}).*$/;

const closingFencePattern = (marker: string): RegExp =>
  new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`);

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const protectFencedCode = (markdown: string): TProtectedMarkdown => {
  const lines = markdown.split('\n');
  const protectedFences: TProtectedFence[] = [];
  let tokenPrefix = 'GroupherProtectedFencedCodeBlock';

  while (markdown.includes(tokenPrefix)) tokenPrefix = `_${tokenPrefix}`;

  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(FENCE_OPEN);
    if (!opening) {
      output.push(lines[index]);
      continue;
    }

    const [, indent, marker] = opening;
    const closingPattern = closingFencePattern(marker);
    let closing = index + 1;
    while (closing < lines.length && !closingPattern.test(lines[closing])) {
      closing += 1;
    }

    if (closing === lines.length) {
      output.push(lines[index]);
      continue;
    }

    const blockLines = lines.slice(index, closing + 1).map((line) =>
      line.startsWith(indent) ? line.slice(indent.length) : line
    );
    const protectedIndex = protectedFences.push({ lines: blockLines }) - 1;
    output.push(`${indent}${tokenPrefix}${protectedIndex}`);
    index = closing;
  }

  const tokenPattern = new RegExp(
    `^([ \\t]*)${escapeRegExp(tokenPrefix)}(\\d+)[ \\t]*$`,
    'gm'
  );

  return {
    markdown: output.join('\n'),
    restore: (value) =>
      value.replace(tokenPattern, (_match, indent: string, rawIndex: string) => {
        const block = protectedFences[Number(rawIndex)];
        if (!block) return _match;

        return block.lines.map((line) => `${indent}${line}`).join('\n');
      }),
  };
};
