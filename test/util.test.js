const {
  isGiven,
  isNotString,
  isNotHashOrTag,
  isNotSemverReleaseType,
  isNotSemver,
  isNotArray
} = require('../lib/util/validators');

describe('Call of isGiven(value)', () => {
  test('should return true for any value except null and undefined', () => {
    expect.assertions(14);

    expect(isGiven('str')).toBe(true);
    expect(isGiven('')).toBe(true);

    expect(isGiven(123)).toBe(true);
    expect(isGiven(0)).toBe(true);
    expect(isGiven(-0)).toBe(true);
    expect(isGiven(0n)).toBe(true);
    expect(isGiven(NaN)).toBe(true);
    expect(isGiven(Infinity)).toBe(true);

    expect(isGiven(true)).toBe(true);
    expect(isGiven(false)).toBe(true);

    expect(isGiven([])).toBe(true);
    expect(isGiven({})).toBe(true);
    expect(isGiven(Symbol('s'))).toBe(true);

    expect(isGiven(() => {})).toBe(true);
  });

  test('should return false for value equal to null or undefined', () => {
    expect.assertions(3);

    expect(isGiven(null)).toBe(false);
    expect(isGiven(undefined)).toBe(false);
    expect(isGiven()).toBe(false);
  });
});

describe('Call of isNotString(value)', () => {
  test('should return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotString(123)).toBe(true);
    expect(isNotString(NaN)).toBe(true);
    expect(isNotString(Infinity)).toBe(true);
    expect(isNotString(true)).toBe(true);
    expect(isNotString(false)).toBe(true);
    expect(isNotString([])).toBe(true);
    expect(isNotString({})).toBe(true);
    expect(isNotString(Symbol('s'))).toBe(true);
    expect(isNotString(() => {})).toBe(true);
    expect(isNotString(null)).toBe(true);
    expect(isNotString(undefined)).toBe(true);
    expect(isNotString()).toBe(true);
    expect(isNotString('')).toBe(true);
  });

  test('should return false for value equal to only a non empty string', () => {
    expect.assertions(1);

    expect(isNotString('str')).toBe(false);
  });
});

describe('Call of isNotHashOrTag(value)', () => {
  test('should return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotHashOrTag(123)).toBe(true);
    expect(isNotHashOrTag(NaN)).toBe(true);
    expect(isNotHashOrTag(Infinity)).toBe(true);
    expect(isNotHashOrTag(true)).toBe(true);
    expect(isNotHashOrTag(false)).toBe(true);
    expect(isNotHashOrTag([])).toBe(true);
    expect(isNotHashOrTag({})).toBe(true);
    expect(isNotHashOrTag(Symbol('s'))).toBe(true);
    expect(isNotHashOrTag(() => {})).toBe(true);
    expect(isNotHashOrTag(null)).toBe(true);
    expect(isNotHashOrTag(undefined)).toBe(true);
    expect(isNotHashOrTag()).toBe(true);
    expect(isNotHashOrTag('')).toBe(true);
  });

  test('should return true for a not valid git commit hash (sha1)', () => {
    expect.assertions(20);

    expect(isNotHashOrTag('12s4')).toBe(true);
    expect(isNotHashOrTag('1.2s.4')).toBe(true);
    expect(isNotHashOrTag('a')).toBe(true);
    expect(isNotHashOrTag('4ec99f747f787984e7f7e94d56ef6309747b215f5')).toBe(true);

    expect(isNotHashOrTag('c71f64b^')).toBe(true);
    expect(isNotHashOrTag('c71f64b^^')).toBe(true);
    expect(isNotHashOrTag('c71f64b^2')).toBe(true);
    expect(isNotHashOrTag('^c71f64b')).toBe(true);
    expect(isNotHashOrTag('c71f64b~')).toBe(true);
    expect(isNotHashOrTag('c71f64b~~')).toBe(true);
    expect(isNotHashOrTag('c71f64b~2')).toBe(true);
    expect(isNotHashOrTag('~c71f64b')).toBe(true);

    expect(isNotHashOrTag('..')).toBe(true);
    expect(isNotHashOrTag('c71f64b..')).toBe(true);
    expect(isNotHashOrTag('c71f64b..c71f64b')).toBe(true);
    expect(isNotHashOrTag('..c71f64b')).toBe(true);

    expect(isNotHashOrTag('...')).toBe(true);
    expect(isNotHashOrTag('c71f64b...')).toBe(true);
    expect(isNotHashOrTag('c71f64b...c71f64b')).toBe(true);
    expect(isNotHashOrTag('...c71f64b')).toBe(true);
  });

  test('should return true for a not valid semver tag name', () => {
    expect.assertions(6);

    expect(isNotHashOrTag('v01.02.03')).toBe(true);
    expect(isNotHashOrTag('01.02.03')).toBe(true);
    expect(isNotHashOrTag('.1.3')).toBe(true);
    expect(isNotHashOrTag('3')).toBe(true);
    expect(isNotHashOrTag('123')).toBe(true);
    expect(isNotHashOrTag('head')).toBe(true);
  });

  test('should return false for a valid git commit hash (sha1)', () => {
    expect.assertions(3);

    expect(isNotHashOrTag('4ec99f747f787984e7f7e94d56ef6309747b215f')).toBe(false);
    expect(isNotHashOrTag('4ec99f7')).toBe(false);
    expect(isNotHashOrTag('4ec99')).toBe(false);
  });

  test('should return false for a valid semver tag name', () => {
    expect.assertions(6);

    expect(isNotHashOrTag('v9.9.9')).toBe(false);
    expect(isNotHashOrTag('v1.2.3')).toBe(false);
    expect(isNotHashOrTag('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotHashOrTag('9.9.9')).toBe(false);
    expect(isNotHashOrTag('1.2.3')).toBe(false);
    expect(isNotHashOrTag('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });

  test('should return false for the `HEAD` alias tag', () => {
    expect.assertions(1);

    expect(isNotHashOrTag('HEAD')).toBe(false);
  });
});

describe('Call of isNotSemverReleaseType(value)', () => {
  test('should return false for the string values `(pre)major`, `(pre)minor`, `(pre)patch` and `prerelease`', () => {
    expect.assertions(7);

    expect(isNotSemverReleaseType('major')).toBe(false);
    expect(isNotSemverReleaseType('premajor')).toBe(false);

    expect(isNotSemverReleaseType('minor')).toBe(false);
    expect(isNotSemverReleaseType('preminor')).toBe(false);

    expect(isNotSemverReleaseType('patch')).toBe(false);
    expect(isNotSemverReleaseType('prepatch')).toBe(false);

    expect(isNotSemverReleaseType('prerelease')).toBe(false);
  });

  test('should return true for any value except `(pre)major`, `(pre)minor`, `(pre)patch` and prerelease', () => {
    expect.assertions(26);

    expect(isNotSemverReleaseType()).toBe(true);
    expect(isNotSemverReleaseType(null)).toBe(true);
    expect(isNotSemverReleaseType(undefined)).toBe(true);

    expect(isNotSemverReleaseType(123)).toBe(true);
    expect(isNotSemverReleaseType(NaN)).toBe(true);
    expect(isNotSemverReleaseType(Infinity)).toBe(true);
    expect(isNotSemverReleaseType(true)).toBe(true);
    expect(isNotSemverReleaseType(false)).toBe(true);
    expect(isNotSemverReleaseType([])).toBe(true);
    expect(isNotSemverReleaseType({})).toBe(true);
    expect(isNotSemverReleaseType(Symbol('s'))).toBe(true);
    expect(isNotSemverReleaseType(() => {})).toBe(true);
    expect(isNotSemverReleaseType('')).toBe(true);

    expect(isNotSemverReleaseType('next')).toBe(true);
    expect(isNotSemverReleaseType('new')).toBe(true);
    expect(isNotSemverReleaseType('latest')).toBe(true);
    expect(isNotSemverReleaseType('majority')).toBe(true);
    expect(isNotSemverReleaseType('minority')).toBe(true);
    expect(isNotSemverReleaseType('pat')).toBe(true);

    expect(isNotSemverReleaseType('MAJOR')).toBe(true);
    expect(isNotSemverReleaseType('PREMAJOR')).toBe(true);

    expect(isNotSemverReleaseType('MINOR')).toBe(true);
    expect(isNotSemverReleaseType('PREMINOR')).toBe(true);

    expect(isNotSemverReleaseType('PATCH')).toBe(true);
    expect(isNotSemverReleaseType('PREPATCH')).toBe(true);

    expect(isNotSemverReleaseType('PRERELEASE')).toBe(true);
  });
});

describe('Call of isNotSemver(value) should', () => {
  test('return true for any value except a non empty string', () => {
    expect.assertions(13);

    expect(isNotSemver(123)).toBe(true);
    expect(isNotSemver(NaN)).toBe(true);
    expect(isNotSemver(Infinity)).toBe(true);
    expect(isNotSemver(true)).toBe(true);
    expect(isNotSemver(false)).toBe(true);
    expect(isNotSemver([])).toBe(true);
    expect(isNotSemver({})).toBe(true);
    expect(isNotSemver(Symbol('s'))).toBe(true);
    expect(isNotSemver(() => {})).toBe(true);
    expect(isNotSemver(null)).toBe(true);
    expect(isNotSemver(undefined)).toBe(true);
    expect(isNotSemver()).toBe(true);
    expect(isNotSemver('')).toBe(true);
  });

  test('return true for a not valid semver number', () => {
    expect.assertions(8);

    expect(isNotSemver('v01.02.03')).toBe(true);
    expect(isNotSemver('01.02.03')).toBe(true);
    expect(isNotSemver('.1.3')).toBe(true);
    expect(isNotSemver('1.3')).toBe(true);
    expect(isNotSemver('3')).toBe(true);
    expect(isNotSemver('123')).toBe(true);
    expect(isNotSemver('HEAD')).toBe(true);
    expect(isNotSemver('head')).toBe(true);
  });

  test('return false for a valid semver number', () => {
    expect.assertions(6);

    expect(isNotSemver('v9.9.9')).toBe(false);
    expect(isNotSemver('v1.2.3')).toBe(false);
    expect(isNotSemver('v1.2.3-next.2.beta.0+build.exp')).toBe(false);

    expect(isNotSemver('9.9.9')).toBe(false);
    expect(isNotSemver('1.2.3')).toBe(false);
    expect(isNotSemver('1.2.3-next.2.beta.0+build.exp')).toBe(false);
  });
});

describe('Call of isNotArray(value) should', () => {
  test('return true for any value except an array', () => {
    expect.assertions(12);

    expect(isNotArray(123)).toBe(true);
    expect(isNotArray(NaN)).toBe(true);
    expect(isNotArray(Infinity)).toBe(true);
    expect(isNotArray(true)).toBe(true);
    expect(isNotArray(false)).toBe(true);
    expect(isNotArray({})).toBe(true);
    expect(isNotArray(Symbol('s'))).toBe(true);
    expect(isNotArray(() => {})).toBe(true);
    expect(isNotArray(null)).toBe(true);
    expect(isNotArray(undefined)).toBe(true);
    expect(isNotArray()).toBe(true);
    expect(isNotArray('')).toBe(true);
  });

  test('return false for any valid array value', () => {
    expect.assertions(4);

    expect(isNotArray([])).toBe(false);
    expect(isNotArray(['a', 'b', 'c'])).toBe(false);
    expect(isNotArray([1])).toBe(false);
    expect(isNotArray([[1],[2]])).toBe(false);
  });
});