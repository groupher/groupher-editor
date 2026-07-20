# Callout compatibility fixtures

This directory records source syntax and golden canonical Groupher editor data
exercised by the Markdown compatibility parser.

Each case in `manifest.json` points to:

- an immutable local input copied from the documented syntax family;
- an `expected/*.json` golden file containing canonical Plate data;
- the official documentation page used to verify the syntax.

The canonical callout contract for this fixture round is:

```json
{
  "type": "callout",
  "variant": "note | info | tip | success | warning | danger | important | custom",
  "title": "optional string",
  "icon": "optional native emoji or Lucide icon name",
  "iconLibrary": "optional lucide",
  "children": [{ "text": "Callout content" }]
}
```

Vendor presentation properties are not canonical data. When an input contains
unsupported presentation-only attributes, the expected result records an
explicit warning diagnostic.

`@platejs/callout` only persists `icon` as a string and defaults it to `💡`.
Plate does not provide a named icon library. Groupher therefore keeps native
emoji strings as-is and normalizes supported vendor icon names to Lucide names,
marked with `iconLibrary: "lucide"`. Unmapped vendor icon names produce a warning
diagnostic rather than silently selecting the wrong icon.

This round intentionally excludes collapsible admonitions such as MkDocs
Material `???`: those map to a toggle or accordion contract rather than a
callout.
