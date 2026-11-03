#!/usr/bin/env python3
"""Version deployed module URLs together to avoid mixed cached releases."""
import re
import sys
from pathlib import Path


def version_site(directory, release):
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', release):
        raise ValueError('Invalid release identifier')
    pattern = re.compile(r'''(["'])(\./[^"'\n]+\.(?:js|css))\1''')
    for file in Path(directory).iterdir():
        if file.is_file() and file.suffix in ('.js', '.html'):
            content = file.read_text()
            file.write_text(pattern.sub(lambda m: f'{m[1]}{m[2]}?v={release}{m[1]}', content))


if __name__ == '__main__':
    version_site(sys.argv[1], sys.argv[2])
