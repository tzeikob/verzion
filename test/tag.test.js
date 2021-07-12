const semver = require('semver');
const exec = require('../lib/util/exec');
const tag = require('../lib/tag.js');

jest.mock('../lib/util/exec', () => jest.fn().mockResolvedValue());

const { any } = expect;

afterEach(() => {
  exec.mockReset();
});

describe('Tag should resolve to undefined', () => {
  test('have git add, commit and tag commands executed in that given order', async () => {
    expect.assertions(8);

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('even if the CHANGELOG file is missing or failed to be staged', async () => {
    expect.assertions(8);

    exec
      .mockResolvedValueOnce('package.json staged successfully')
      .mockRejectedValueOnce(new Error('failed to stage missing CHANGELOG.md'))
      .mockResolvedValueOnce('package-lock.json staged successfully')
      .mockResolvedValueOnce('npm-shrinkwrap.json staged successfully')
      .mockResolvedValueOnce('commit changes successfully')
      .mockResolvedValueOnce('tag created successfully');

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });

  test('even if package lock files are missing or failed to be staged', async () => {
    expect.assertions(8);

    exec
      .mockResolvedValueOnce('package.json staged successfully')
      .mockResolvedValueOnce('CHANGELOG.md staged successfully')
      .mockRejectedValueOnce(new Error('failed to stage missing package-lock.json'))
      .mockRejectedValueOnce(new Error('failed to stage missing npm-shrinkwrap.json'))
      .mockResolvedValueOnce('commit changes successfully')
      .mockResolvedValueOnce('tag created successfully');

    await expect(tag('1.0.0')).resolves.toBeUndefined();

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});

describe('Tag should try to commit changes', () => {
  test('with the default message if message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', message]);
  });

  test('with template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${version}`]);
  });

  test('with version injected into the message template in a clean semver form', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['commit', '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag should try to create an annotation tag', () => {
  test('with tag name equal to the given version arg in the `v1.0.0` form', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${version}`, '-m', any(String)]);
  });

  test('having the given version arg be cleaned via semver before used as tag name', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', `v${semver.clean(version)}`, '-m', any(String)]);
  });

  test('with the default message if the message arg is not given', async () => {
    expect.assertions(2);

    const version = '1.0.0';

    await expect(tag(version)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to v${version}`]);
  });

  test('with message equal to the given message arg', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = `Bump to new version ${version}`;

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', message]);
  });

  test('with a template message using interpolation via `%s` notation', async () => {
    expect.assertions(2);

    const version = '1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${version}`]);
  });

  test('having the given version arg be cleaned via semver before used in the template message', async () => {
    expect.assertions(2);

    const version = 'v1.0.0';
    const message = 'Bump to new v%s';

    await expect(tag(version, message)).resolves.toBeUndefined();

    expect(exec).toBeCalledWith('git', ['tag', '-a', any(String), '-m', `Bump to new v${semver.clean(version)}`]);
  });
});

describe('Tag called with invalid input should reject early with error', () => {
  test('when version argument is not given', async () => {
    expect.assertions(2);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag()).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });

  test('when invalid non semver version argument is given', async () => {
    expect.assertions(5);

    const reason = 'Invalid or missing semver version argument';

    await expect(tag('123')).rejects.toThrow(reason);
    await expect(tag('1.3')).rejects.toThrow(reason);
    await expect(tag('1.alpha.3')).rejects.toThrow(reason);
    await expect(tag('alpha')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(0);
  });
});

describe('Tag should reject early with error', () => {
  test('when `git add package.json` throws a fatal exec error', async () => {
    expect.assertions(3);

    const reason = 'An error occurred executing `git add package.json`';

    exec.mockRejectedValueOnce(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(1);

    expect(exec).toBeCalledWith('git', ['add', 'package.json']);
  });

  test('when `git commit` throws a fatal exec error', async () => {
    expect.assertions(7);

    const reason = 'An error occurred executing git commit';

    exec
      .mockResolvedValueOnce('package.json staged successfully')
      .mockResolvedValueOnce('CHANGELOG.md staged successfully')
      .mockResolvedValueOnce('package-lock.json staged successfully')
      .mockResolvedValueOnce('npm-shrinkwrap.json staged successfully')
      .mockRejectedValueOnce(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(5);
  
    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
  });

  test('when `git tag` throws a fatal exec error', async () => {
    expect.assertions(8);

    const reason = 'An error occurred executing git tag';

    exec
      .mockResolvedValueOnce('package.json staged successfully')
      .mockResolvedValueOnce('CHANGELOG.md staged successfully')
      .mockResolvedValueOnce('package-lock.json staged successfully')
      .mockResolvedValueOnce('npm-shrinkwrap.json staged successfully')
      .mockResolvedValueOnce('commit changes successfully')
      .mockRejectedValueOnce(new Error(reason));

    await expect(tag('1.0.0')).rejects.toThrow(reason);

    expect(exec).toBeCalledTimes(6);

    expect(exec).nthCalledWith(1, 'git', ['add', 'package.json']);
    expect(exec).nthCalledWith(2, 'git', ['add', 'CHANGELOG.md']);
    expect(exec).nthCalledWith(3, 'git', ['add', 'package-lock.json']);
    expect(exec).nthCalledWith(4, 'git', ['add', 'npm-shrinkwrap.json']);

    expect(exec).nthCalledWith(5, 'git', ['commit', '-m', any(String)]);
    expect(exec).nthCalledWith(6, 'git', ['tag', '-a', any(String), '-m', any(String)]);
  });
});