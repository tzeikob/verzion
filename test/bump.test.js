jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
    writeFile: jest.fn().mockResolvedValue(),
  }
}));

const fs = require('fs');
const bump = require('../lib/bump');

const { readFile, writeFile } = fs.promises;
const { any } = expect;

afterEach(() => {
  readFile.mockReset();
  writeFile.mockReset();
});

describe('Bump called with any valid semver release type should', () => {
  test('read first the current version from the package.json file', async () => {
    expect.assertions(2);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });

    expect(readFile).nthCalledWith(1, 'package.json', 'utf8');
  });

  test('clean versions given in prefixed `v0.1.1` form to `0.1.1`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "v0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ current: '0.1.1' });
  });

  test('resolve the next version with respect to release type and current version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toMatchObject({ next: '1.0.0' });
  });

  test('update the prop version in package.json file with the next version', async () => {
    expect.assertions(2);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(writeFile).toBeCalledWith('package.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('update the prop version in any package lock files if present', async () => {
    expect.assertions(5);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).toBeCalledWith('package-lock.json', '{\n  "version": "1.0.0"\n}\n');
    expect(writeFile).toBeCalledWith('npm-shrinkwrap.json', '{\n  "version": "1.0.0"\n}\n');
  });

  test('avoid to update the prop version in a package lock file if not present', async () => {
    expect.assertions(5);

    const error = new Error("ENOENT: no such file or directory, open '*.json'");
    error.code = 'ENOENT';

    readFile.mockImplementation(async (filepath) => {
      switch (filepath) {
        case 'package.json':
          return '{"version": "0.1.1"}';
        case 'package-lock.json':
        case 'npm-shrinkwrap.json':
        default:
          throw error;
      }
    });

    await expect(bump('major')).resolves.toBeDefined();

    expect(readFile).toBeCalledWith('package-lock.json', 'utf8');
    expect(readFile).toBeCalledWith('npm-shrinkwrap.json', 'utf8');

    expect(writeFile).not.toBeCalledWith('package-lock.json', any(String));
    expect(writeFile).not.toBeCalledWith('npm-shrinkwrap.json', any(String));
  });
});

describe('Bump called with a major release type should', () => {
  test('resolve to the next stable major version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0'
    });
  });

  test('resolve to the next stable major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0'
    });
  });

  test('resolve to the next stable major version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '1.0.0'
    });
  });

  test('resolve to the next stable major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('major', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '1.0.0'
    });
  });
});

describe('Bump called with a pre major release type should', () => {
  test('resolve to the next pre alpha major version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0-alpha.0'
    });
  });

  test('resolve to the next pre alpha major version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('premajor')).resolves.toEqual({
      current: '0.1.1',
      next: '1.0.0-0'
    });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '1.0.0-alpha.0'
    });
  });

  test('resolve to the next pre alpha major version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('premajor')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '1.0.0-0'
    });
  });
});

describe('Bump called with a minor release type should', () => {
  test('resolve to the next stable minor version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0'
    });
  });

  test('resolve to the next stable minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0'
    });
  });

  test('resolve to the next stable minor version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.2.0'
    });
  });

  test('resolve to the next stable minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('minor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.2.0'
    });
  });
});

describe('Bump called with a pre minor release type should', () => {
  test('resolve to the next pre alpha minor version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0-alpha.0'
    });
  });

  test('resolve to the next pre alpha minor version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('preminor')).resolves.toEqual({
      current: '0.1.1',
      next: '0.2.0-0'
    });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.2.0-alpha.0'
    });
  });

  test('resolve to the next pre alpha minor version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('preminor')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.2.0-0'
    });
  });
});

describe('Bump called with a patch release type should', () => {
  test('resolve to the next stable patch version taken from a stable version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2'
    });
  });

  test('resolve to the next stable patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2'
    });
  });

  test('resolve to the same stable patch version taken from an alpha version', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1'
    });
  });

  test('resolve to the same stable patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('patch', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1'
    });
  });
});

describe('Bump called with a pre patch release type should', () => {
  test('resolve to the next pre alpha patch version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-alpha.0'
    });
  });

  test('resolve to the next pre alpha patch version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prepatch')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-0'
    });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.1.2-alpha.0'
    });
  });

  test('resolve to the next pre alpha patch version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.0"}');

    await expect(bump('prepatch')).resolves.toEqual({
      current: '0.1.1-alpha.0',
      next: '0.1.2-0'
    });
  });
});

describe('Bump called with a pre release type should', () => {
  test('resolve to the next alpha version taken from a stable version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-0'
    });
  });

  test('resolve to the next alpha version taken from a stable version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({
      current: '0.1.1',
      next: '0.1.2-alpha.0'
    });
  });

  test('resolve to the next alpha version taken from an alpha version given no `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-alpha.2'
    });
  });

  test('resolve to the next alpha version taken from an alpha version given the `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'alpha')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-alpha.2'
    });
  });

  test('resolve to the next beta version taken from an alpha version given the beta `preid`', async () => {
    expect.assertions(1);

    readFile.mockResolvedValue('{"version": "0.1.1-alpha.1"}');

    await expect(bump('prerelease', 'beta')).resolves.toEqual({
      current: '0.1.1-alpha.1',
      next: '0.1.1-beta.0'
    });
  });
});

describe('Bump should reject with error', () => {
  test('when called with no release type argument', async () => {
    expect.assertions(3);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump()).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when called with not valid release type argument', async () => {
    expect.assertions(11);

    const reason = 'Invalid or missing semver release type argument';

    await expect(bump('')).rejects.toThrow(reason);
    await expect(bump('alpha')).rejects.toThrow(reason);
    await expect(bump('MAJOR')).rejects.toThrow(reason);
    await expect(bump('PREMAJOR')).rejects.toThrow(reason);
    await expect(bump('MINOR')).rejects.toThrow(reason);
    await expect(bump('PREMINOR')).rejects.toThrow(reason);
    await expect(bump('PATCH')).rejects.toThrow(reason);
    await expect(bump('PREPATCH')).rejects.toThrow(reason);
    await expect(bump('PRERELEASE')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(0);
    expect(writeFile).toBeCalledTimes(0);
  });

  test('when there is no package.json file found', async () => {
    expect.assertions(4);

    const reason = 'No such file or directory: package.json';

    readFile.mockRejectedValueOnce(new Error(reason));

    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is an package.json file but the content has invalid JSON syntax', async () => {
    expect.assertions(4);

    readFile.mockResolvedValueOnce('{version: "123"');

    await expect(bump('major')).rejects.toThrow(SyntaxError);

    expect(readFile).toBeCalledTimes(1);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is a package.json file which parsed to a not valid JSON object', async () => {
    expect.assertions(6);

    const reason = 'Invalid or malformed JSON file: package.json';

    readFile.mockResolvedValueOnce('123');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('null');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('[]');
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(3);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });

  test('when there is a package.json file but has no or invalid semver version number', async () => {
    expect.assertions(5);

    const reason = 'Invalid or missing semver version in JSON file: package.json';

    readFile.mockResolvedValueOnce('{}');
    await expect(bump('major')).rejects.toThrow(reason);

    readFile.mockResolvedValueOnce('{"version": "123"}');
    await expect(bump('major')).rejects.toThrow(reason);

    expect(readFile).toBeCalledTimes(2);
    expect(writeFile).toBeCalledTimes(0);

    expect(readFile).toBeCalledWith('package.json', 'utf8');
  });
});