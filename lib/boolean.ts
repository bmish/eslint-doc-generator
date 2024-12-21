export function isBooleanable(value: unknown): boolean {
  switch (typeof value) {
    case 'string': {
      return [
        'true',
        't',
        'yes',
        'y',
        'on',
        '1',
        'false',
        'f',
        'no',
        'n',
        'off',
        '0',
      ].includes(value.trim().toLowerCase());
    }

    case 'number': {
      return [0, 1].includes(Number(value).valueOf());
    }

    case 'boolean': {
      return true;
    }

    default: {
      return false;
    }
  }
}
