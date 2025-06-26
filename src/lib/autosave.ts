export interface AutosaveData {
	courseId: string;
	scores: Record<string, number | null>;
	lastSaved: number;
}

const AUTOSAVE_KEY_PREFIX = 'scoreflow_autosave_';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const AUTOSAVE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export class AutosaveManager {
	private interval: number | null = null;
	private courseId: string;
	private onSave: () => void;

	constructor(courseId: string, onSave: () => void) {
		this.courseId = courseId;
		this.onSave = onSave;
	}

	start() {
		if (this.interval) return;
		
		this.interval = window.setInterval(() => {
			this.onSave();
		}, AUTOSAVE_INTERVAL);
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	save(scores: Record<string, number | null>) {
		if (typeof window === 'undefined') return;

		const data: AutosaveData = {
			courseId: this.courseId,
			scores,
			lastSaved: Date.now()
		};

		try {
			localStorage.setItem(
				`${AUTOSAVE_KEY_PREFIX}${this.courseId}`,
				JSON.stringify(data)
			);
		} catch (error) {
			console.warn('Failed to save autosave data:', error);
		}
	}

	load(): Record<string, number | null> | null {
		if (typeof window === 'undefined') return null;

		try {
			const saved = localStorage.getItem(`${AUTOSAVE_KEY_PREFIX}${this.courseId}`);
			if (!saved) return null;

			const data: AutosaveData = JSON.parse(saved);
			
			// Check if data is expired
			if (Date.now() - data.lastSaved > AUTOSAVE_EXPIRY) {
				this.clear();
				return null;
			}

			return data.scores;
		} catch (error) {
			console.warn('Failed to load autosave data:', error);
			return null;
		}
	}

	clear() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.removeItem(`${AUTOSAVE_KEY_PREFIX}${this.courseId}`);
		} catch (error) {
			console.warn('Failed to clear autosave data:', error);
		}
	}

	hasAutosaveData(): boolean {
		if (typeof window === 'undefined') return false;
		
		try {
			const saved = localStorage.getItem(`${AUTOSAVE_KEY_PREFIX}${this.courseId}`);
			if (!saved) return false;

			const data: AutosaveData = JSON.parse(saved);
			return Date.now() - data.lastSaved <= AUTOSAVE_EXPIRY;
		} catch {
			return false;
		}
	}

	getLastSavedTime(): Date | null {
		if (typeof window === 'undefined') return null;

		try {
			const saved = localStorage.getItem(`${AUTOSAVE_KEY_PREFIX}${this.courseId}`);
			if (!saved) return null;

			const data: AutosaveData = JSON.parse(saved);
			return new Date(data.lastSaved);
		} catch {
			return null;
		}
	}

	// Clean up all expired autosave data
	static cleanupExpired() {
		if (typeof window === 'undefined') return;

		try {
			const keys = Object.keys(localStorage).filter(key => 
				key.startsWith(AUTOSAVE_KEY_PREFIX)
			);

			for (const key of keys) {
				const saved = localStorage.getItem(key);
				if (!saved) continue;

				try {
					const data: AutosaveData = JSON.parse(saved);
					if (Date.now() - data.lastSaved > AUTOSAVE_EXPIRY) {
						localStorage.removeItem(key);
					}
				} catch {
					// Invalid data, remove it
					localStorage.removeItem(key);
				}
			}
		} catch (error) {
			console.warn('Failed to cleanup expired autosave data:', error);
		}
	}
}
