#!/usr/bin/env python3
"""Update copyright + contact in src/lib/translations.js to Qup DA."""
import json
import re
from pathlib import Path

TRANSLATIONS_FILE = Path("src/lib/translations.js")

# Same value across all languages — copyright text is mostly Latin chars
# and the company name + org number is identity, not translation
COPYRIGHT = "Copyright 2026 – Qup DA (org: 998 185 599)"
CONTACT = "post@qupda.no"

# Set this per-language if you want translated "Copyright" word.
# Most apps just use English-style copyright everywhere.
VALUES = {
    "en": {"copyright": COPYRIGHT, "contact": CONTACT},
    "no": {"copyright": COPYRIGHT, "contact": CONTACT},
    "nl": {"copyright": COPYRIGHT, "contact": CONTACT},
    "fr": {"copyright": COPYRIGHT, "contact": CONTACT},
    "de": {"copyright": COPYRIGHT, "contact": CONTACT},
    "it": {"copyright": COPYRIGHT, "contact": CONTACT},
    "sv": {"copyright": COPYRIGHT, "contact": CONTACT},
    "da": {"copyright": COPYRIGHT, "contact": CONTACT},
    "fi": {"copyright": COPYRIGHT, "contact": CONTACT},
    "es": {"copyright": COPYRIGHT, "contact": CONTACT},
    "pl": {"copyright": COPYRIGHT, "contact": CONTACT},
    "pt": {"copyright": COPYRIGHT, "contact": CONTACT},
}


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def patch_language_block(content: str, lang: str, entries: dict) -> str:
    open_pattern = re.compile(rf'"{lang}":\s*\{{')
    open_match = open_pattern.search(content)
    if not open_match:
        print(f"  ⚠️  Could not find opening for '{lang}'")
        return content

    start = open_match.end()
    depth = 1
    i = start
    in_string = False
    string_char = None
    while i < len(content) and depth > 0:
        c = content[i]
        if in_string:
            if c == "\\":
                i += 2
                continue
            if c == string_char:
                in_string = False
        else:
            if c == '"' or c == "'":
                in_string = True
                string_char = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
        i += 1

    if depth != 0:
        return content

    block_start = open_match.end()
    block_end = i
    block = content[block_start:block_end]

    for key, value in entries.items():
        line = f'    "{key}": {js_string(value)},'
        key_pattern = re.compile(
            rf'^\s*"{re.escape(key)}":\s*.*?,?\s*$',
            re.MULTILINE,
        )
        if key_pattern.search(block):
            block = key_pattern.sub(line, block, count=1)
        else:
            if block.endswith("\n"):
                block = block + line + "\n  "
            else:
                block = block.rstrip() + "\n" + line + "\n  "

    return content[:block_start] + block + content[block_end:]


def main() -> None:
    if not TRANSLATIONS_FILE.exists():
        raise SystemExit(f"❌ {TRANSLATIONS_FILE} not found")

    content = TRANSLATIONS_FILE.read_text(encoding="utf-8")
    for lang, entries in VALUES.items():
        print(f"Patching '{lang}'…")
        content = patch_language_block(content, lang, entries)

    TRANSLATIONS_FILE.write_text(content, encoding="utf-8")
    print(f"✅ Patched 2 keys × {len(VALUES)} languages = {2 * len(VALUES)} entries")


if __name__ == "__main__":
    main()