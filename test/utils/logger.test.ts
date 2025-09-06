import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { initialize, updateSettings, isDebugEnabled, info, warn, error, debug } from "../../src/utils/logger";
import type { SchemaFormSettings } from "../../src/settings";

describe("Logger Module", () => {
  let consoleMocks: {
    info: ReturnType<typeof spyOn>;
    warn: ReturnType<typeof spyOn>;
    error: ReturnType<typeof spyOn>;
    debug: ReturnType<typeof spyOn>;
  };

  beforeEach(() => {
    consoleMocks = {
      info: spyOn(console, "info").mockImplementation(() => {}),
      warn: spyOn(console, "warn").mockImplementation(() => {}),
      error: spyOn(console, "error").mockImplementation(() => {}),
      debug: spyOn(console, "debug").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(consoleMocks).forEach(mock => mock.mockRestore());
  });

  describe("initialize", () => {
    test("should set initial settings", () => {
      const settings: SchemaFormSettings = {
        debugFlag: true,
        schemaDir: "test/schemas"
      };
      initialize(settings);
      expect(isDebugEnabled()).toBe(true);
    });

    test("should enable debug when debugFlag is true", () => {
      initialize({
        debugFlag: true,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(true);
    });

    test("should disable debug when debugFlag is false", () => {
      initialize({
        debugFlag: false,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe("updateSettings", () => {
    test("should update existing settings", () => {
      initialize({
        debugFlag: false,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(false);

      updateSettings({
        debugFlag: true,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(true);
    });
  });

  describe("isDebugEnabled", () => {
    test("should return false when debugFlag is false", () => {
      initialize({
        debugFlag: false,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(false);
    });

    test("should return true when debugFlag is true", () => {
      initialize({
        debugFlag: true,
        schemaDir: "test/schemas"
      });
      expect(isDebugEnabled()).toBe(true);
    });

    test("should handle malformed data gracefully", () => {
      initialize({
        schemaDir: "test/schemas"
      } as any);
      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe("logging functions", () => {
    beforeEach(() => {
      initialize({
        debugFlag: false,
        schemaDir: "test/schemas"
      });
    });

    test("info should log with info emoji", () => {
      info("test message", "extra data");
      expect(consoleMocks.info).toHaveBeenCalledWith("ℹ️", "test message", "extra data");
    });

    test("warn should log with warning emoji", () => {
      warn("warning message");
      expect(consoleMocks.warn).toHaveBeenCalledWith("⚠️", "warning message");
    });

    test("error should log with error emoji", () => {
      error("error message");
      expect(consoleMocks.error).toHaveBeenCalledWith("💀", "error message");
    });

    test("debug should not log when debug is disabled", () => {
      debug("debug message");
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });

    test("debug should log when debug is enabled", () => {
      updateSettings({
        debugFlag: true,
        schemaDir: "test/schemas"
      });
      debug("debug message", "extra");
      expect(consoleMocks.debug).toHaveBeenCalledWith("🤖", "debug message", "extra");
    });
  });
});
