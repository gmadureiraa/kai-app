/**
 * Barrel export do módulo de tools do kai-simple-chat.
 * Re-exporta tipos, registry e runner pra simplificar imports no index.ts.
 */
export type {
  RegisteredTool,
  ToolDefinition,
  ToolExecutionContext,
  ToolHandler,
  ToolHandlerResult,
  ToolParameterSchema,
  SupabaseClient,
} from "./types.ts";

export { ToolRegistry } from "./registry.ts";

export {
  runToolLoop,
  type GeminiContent,
  type GeminiPart,
  type GeminiStreamResponse,
  type RunToolLoopOptions,
} from "./runner.ts";
