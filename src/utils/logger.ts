export function createLogger(isDebug: boolean) {
	return {
		info: (...args: unknown[]) => console.info("INFO:", ...args),
		warn: (...args: unknown[]) => console.warn("WARN:", ...args),
		error: (...args: unknown[]) => console.error("ERROR:", ...args),
		debug: (...args: unknown[]) => {
			if (isDebug) console.debug("DEBUG:", ...args);
		},
	};
}
