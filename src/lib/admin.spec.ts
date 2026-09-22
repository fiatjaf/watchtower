import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminStore } from './admin.svelte.js';
import type { Nip86Client } from './nostr/nip86';
import type { Nip07Provider } from './nostr/signer';
import { session } from './session.svelte.js';

const PUBKEY = 'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9';
const OTHER_PUBKEY = 'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5';
const RELAY_URL = 'wss://relay.example.com/';

function provider(pubkey: string): Nip07Provider {
	return {
		getPublicKey: async () => pubkey,
		signEvent: async () => {
			throw new Error('signing is not used in these tests');
		}
	};
}

/** A client whose supportedmethods we control; counts how often it is asked. */
function fakeClient(answer: () => Promise<string[]>): {
	client: Nip86Client;
	calls: () => number;
} {
	let calls = 0;
	const client = {
		call: async () => ({}),
		supportedMethods: async () => {
			calls += 1;
			return answer();
		}
	} as unknown as Nip86Client;
	return { client, calls: () => calls };
}

beforeEach(async () => {
	vi.stubGlobal('nostr', provider(PUBKEY));
	await session.signIn(RELAY_URL);
});

afterEach(() => {
	session.signOut();
	vi.unstubAllGlobals();
});

describe('AdminStore', () => {
	it('shares one request between calls that happen at the same time', async () => {
		const { client, calls } = fakeClient(async () => ['banpubkey', 'blockip']);
		const store = new AdminStore(() => client);

		await Promise.all([store.load(), store.load()]);

		expect(calls()).toBe(1);
		expect(store.methods).toEqual(['banpubkey', 'blockip']);
		expect(store.ready).toBe(true);
	});

	it('only claims a method is missing once the list is known', async () => {
		const { client } = fakeClient(async () => ['banpubkey']);
		const store = new AdminStore(() => client);

		expect(store.lacks('blockip')).toBe(false);
		await store.load();
		expect(store.lacks('blockip')).toBe(true);
		expect(store.lacks('banpubkey')).toBe(false);
	});

	it('keeps the error and stays not ready when the relay fails', async () => {
		const { client } = fakeClient(async () => {
			throw new Error('relay rejected the request (HTTP 401)');
		});
		const store = new AdminStore(() => client);

		await store.load();

		expect(store.ready).toBe(false);
		expect(store.error).toMatch(/401/);
		expect(await store.ensure()).toBe(false);
	});

	it('ignores an answer that belongs to an older session', async () => {
		let release: (methods: string[]) => void = () => {};
		const gate = new Promise<string[]>((resolve) => (release = resolve));
		const { client } = fakeClient(() => gate);
		const store = new AdminStore(() => client);

		const loading = store.load();
		await vi.waitFor(() => expect(store.loading).toBe(true));

		// The user signs in to another account while the relay still answers.
		vi.stubGlobal('nostr', provider(OTHER_PUBKEY));
		await session.signIn(RELAY_URL);
		release(['banpubkey']);
		await loading;

		expect(store.methods).toEqual([]);
		expect(store.ready).toBe(false);
	});

	it('ignores results that are not a list of names', async () => {
		const { client } = fakeClient(async () => 42 as unknown as string[]);
		const store = new AdminStore(() => client);

		await store.load();

		expect(store.methods).toEqual([]);
		expect(store.ready).toBe(true);
	});

	it('forgets everything on reset', async () => {
		const { client } = fakeClient(async () => ['banpubkey']);
		const store = new AdminStore(() => client);
		await store.load();

		store.reset();

		expect(store.methods).toEqual([]);
		expect(store.ready).toBe(false);
		expect(store.error).toBeNull();
	});

	it('does not ask without a session', async () => {
		session.signOut();
		const { client, calls } = fakeClient(async () => ['banpubkey']);
		const store = new AdminStore(() => client);

		await store.load();

		expect(calls()).toBe(0);
		expect(store.ready).toBe(false);
	});
});
