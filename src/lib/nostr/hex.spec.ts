import { describe, expect, it } from 'vitest';
import { isHexBytes, normalizeHex32 } from './hex';

describe('isHexBytes', () => {
	it('accepts hex of the exact length in either case and trims spaces', () => {
		expect(isHexBytes('AB'.repeat(32), 32)).toBe(true);
		expect(isHexBytes('ab'.repeat(32), 32)).toBe(true);
		expect(isHexBytes(`  ${'ab'.repeat(32)}  `, 32)).toBe(true);
	});

	it('rejects wrong lengths and non-hex characters', () => {
		expect(isHexBytes('ab'.repeat(31), 32)).toBe(false);
		expect(isHexBytes('ab'.repeat(33), 32)).toBe(false);
		expect(isHexBytes(`${'ab'.repeat(31)}zz`, 32)).toBe(false);
		expect(isHexBytes('', 32)).toBe(false);
	});
});

describe('normalizeHex32', () => {
	it('lowercases a valid value', () => {
		expect(normalizeHex32('AB'.repeat(32))).toBe('ab'.repeat(32));
	});

	it('throws for anything else', () => {
		expect(() => normalizeHex32('nope')).toThrow(/32 bytes of hex/);
		expect(() => normalizeHex32('ab'.repeat(31))).toThrow(/32 bytes of hex/);
	});
});
