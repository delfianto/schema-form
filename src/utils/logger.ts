export function createLogger(isDebug: boolean) {
	return {
		info: (...args: any[]) => console.info("INFO:", ...args),
		warn: (...args: any[]) => console.warn("WARN:", ...args),
		error: (...args: any[]) => console.error("ERROR:", ...args),
		debug: (...args: any[]) => {
			if (isDebug) console.debug("DEBUG:", ...args);
		},
	};
}
