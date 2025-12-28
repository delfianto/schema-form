import type { Field } from "../schema";
import { DefaultRenderer } from "./renderers/DefaultRenderer";
import type { FieldRendererStrategy } from "./renderers/types";

export class RendererRegistry {
  private strategies: FieldRendererStrategy<Field>[] = [];
  private defaultStrategy: FieldRendererStrategy<Field> = new DefaultRenderer();

  register(strategy: FieldRendererStrategy<Field>): void {
    const exists = this.strategies.some((s) => s.constructor.name === strategy.constructor.name);
    if (!exists) {
      this.strategies.push(strategy);
    }
  }

  getStrategies(): FieldRendererStrategy<Field>[] {
    return [...this.strategies];
  }

  getStrategy(type: string): FieldRendererStrategy<Field> {
    return this.strategies.find((s) => s.supports(type)) || this.defaultStrategy;
  }

  clear(): void {
    this.strategies = [];
  }
}

// Default instance for backward compatibility
export const defaultRegistry = new RendererRegistry();
