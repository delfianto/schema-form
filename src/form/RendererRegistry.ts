import type { Field } from "../schema";
import { DefaultRenderer } from "./renderers/DefaultRenderer";
import type { FieldRendererStrategy } from "./renderers/types";

const strategies: FieldRendererStrategy<Field>[] = [];
const defaultStrategy: FieldRendererStrategy<Field> = new DefaultRenderer();

export const RendererRegistry = {
  register(strategy: FieldRendererStrategy<Field>) {
    // Check if strategy already exists to avoid duplicates
    const exists = strategies.some((s) => s.constructor.name === strategy.constructor.name);
    if (!exists) {
      strategies.push(strategy);
    }
  },

  getStrategies(): FieldRendererStrategy<Field>[] {
    return strategies;
  },

  getStrategy(type: string): FieldRendererStrategy<Field> {
    return strategies.find((s) => s.supports(type)) || defaultStrategy;
  },

  clear() {
    strategies.length = 0;
  },
} as const;
