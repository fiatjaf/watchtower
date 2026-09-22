import {
	Nip86AuthError,
	createNip86Client,
	type Nip86Client,
	type Nip86Method
} from './nostr/nip86';
import { session } from './session.svelte.js';

/** Turns errors from the management API into something a person can act on. */
export function describeError(cause: unknown): string {
	if (cause instanceof Nip86AuthError) {
		return `${cause.message}. Check that this key is allowed to manage the relay.`;
	}
	return cause instanceof Error ? cause.message : String(cause);
}

/** Builds a client for the current session; replaceable for tests. */
export type AdminClientFactory = () => Nip86Client | null;

function sessionClient(): Nip86Client | null {
	const signer = session.signer;
	if (!signer) return null;
	return createNip86Client({ relayUrl: session.relayUrl, signer });
}

function sessionKey(): string | null {
	if (!session.isAuthenticated) return null;
	return `${session.relayUrl}|${session.pubkey ?? ''}`;
}

/** State shared by the management screens: the client and its method list. */
export class AdminStore {
	methods = $state<string[]>([]);
	loading = $state(false);
	/** True once the method list of the current session has been read. */
	ready = $state(false);
	error = $state<string | null>(null);
	#createClient: AdminClientFactory;
	#loadedFor: string | null = null;
	#inFlight: { key: string; promise: Promise<void> } | null = null;

	constructor(createClient: AdminClientFactory = sessionClient) {
		this.#createClient = createClient;
	}

	supports(method: Nip86Method | string): boolean {
		return this.methods.includes(method);
	}

	/**
	 * True when the method list is loaded and the relay really lacks the method.
	 * While the list is still being read this stays false, so screens do not
	 * claim a method is unsupported before they know.
	 */
	lacks(method: Nip86Method | string): boolean {
		return this.ready && !this.supports(method);
	}

	/** Forgets everything; used when the session goes away. */
	reset(): void {
		this.methods = [];
		this.loading = false;
		this.ready = false;
		this.error = null;
		this.#loadedFor = null;
		this.#inFlight = null;
	}

	/** Loads the method list when needed; false when the relay cannot be asked. */
	async ensure(): Promise<boolean> {
		await this.load();
		return this.ready && this.error === null;
	}

	/**
	 * Asks the relay which methods it supports, once per relay and key. Callers
	 * that ask at the same time share one request, so the extension is only
	 * asked to sign once.
	 */
	async load(force = false): Promise<void> {
		const key = sessionKey();
		if (!key) return;
		if (!force && this.ready && this.#loadedFor === key) return;
		if (this.#inFlight?.key === key) return this.#inFlight.promise;

		const promise = this.#load(key).finally(() => {
			if (this.#inFlight?.promise === promise) this.#inFlight = null;
		});
		this.#inFlight = { key, promise };
		return promise;
	}

	async call<T>(method: Nip86Method | string, params: unknown[] = []): Promise<T> {
		const client = this.#createClient();
		if (!client) throw new Error('not signed in to a relay');
		return client.call<T>(method, params);
	}

	async #load(key: string): Promise<void> {
		const client = this.#createClient();
		if (!client) return;

		// Another session: do not show the previous relay's methods meanwhile.
		if (this.#loadedFor !== key) {
			this.methods = [];
			this.ready = false;
		}

		this.loading = true;
		this.error = null;
		try {
			const methods = await client.supportedMethods();
			if (sessionKey() !== key) return; // the session changed while we waited
			this.methods = Array.isArray(methods) ? methods.filter((one) => typeof one === 'string') : [];
			this.ready = true;
			this.#loadedFor = key;
		} catch (cause) {
			if (sessionKey() !== key) return;
			this.methods = [];
			this.ready = false;
			this.#loadedFor = null;
			this.error = describeError(cause);
		} finally {
			if (sessionKey() === key) {
				this.loading = false;
			}
		}
	}
}

export const admin = new AdminStore();
