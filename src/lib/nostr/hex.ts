/** True when `value` is exactly `bytes` bytes of hex. */
export function isHexBytes(value: string, bytes: number): boolean {
	const normalized = value.trim().toLowerCase();
	return normalized.length === bytes * 2 && /^[0-9a-f]+$/.test(normalized);
}

/** Lowercases a hex value that is expected to be 32 bytes (event ids, pubkeys). */
export function normalizeHex32(value: string): string {
	const normalized = value.trim().toLowerCase();
	if (!isHexBytes(normalized, 32)) {
		throw new Error('expected 32 bytes of hex');
	}
	return normalized;
}
