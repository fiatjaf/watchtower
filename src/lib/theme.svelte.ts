import { browserStorage, type StorageLike } from './storage';

export const THEME_STORAGE_KEY = 'tower.theme';

export type ThemeMode = 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

/** Reads a stored preference; null when this browser has not chosen yet. */
export function parseThemeMode(value: string | null): ThemeMode | null {
	return value === 'light' || value === 'dark' ? value : null;
}

/** The theme to show: the chosen one, or the system preference before any choice. */
export function resolveTheme(mode: ThemeMode | null, systemPrefersDark: boolean): ResolvedTheme {
	if (mode !== null) return mode;
	return systemPrefersDark ? 'dark' : 'light';
}

function systemPrefersDark(): boolean {
	return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Theme choice of the browser, kept in localStorage and applied to <html>. */
export class ThemeStore {
	/** Null until the visitor picks light or dark themselves. */
	mode = $state<ThemeMode | null>(null);
	#storage: StorageLike | null;
	#started = false;

	constructor(storage: StorageLike | null = browserStorage('local')) {
		this.#storage = storage;
	}

	/** The theme that is on screen right now. */
	get resolved(): ResolvedTheme {
		return resolveTheme(this.mode, systemPrefersDark());
	}

	/** Applies the stored choice and follows later system changes. Call once. */
	start(): void {
		if (this.#started) return;
		this.#started = true;
		this.mode = parseThemeMode(this.#storage?.getItem(THEME_STORAGE_KEY) ?? null);
		this.#apply();

		globalThis.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (this.mode === null) this.#apply();
		});
	}

	set(mode: ThemeMode): void {
		this.mode = mode;
		try {
			this.#storage?.setItem(THEME_STORAGE_KEY, mode);
		} catch {
			// Private mode: the choice simply does not survive a reload.
		}
		this.#apply();
	}

	#apply(): void {
		globalThis.document?.documentElement.classList.toggle('dark', this.resolved === 'dark');
	}
}

export const theme = new ThemeStore();
