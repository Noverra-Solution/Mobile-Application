/**
 * OptionalOnDeviceLLMProvider Abstraction
 * ----------------------------------------------------------------------------
 * Pluggable architecture interface for future on-device local LLM execution
 * (e.g. LiteRT-LM / Gemma 2B / ExecuTorch).
 *
 * Requirements:
 * - Operates strictly on retrieved local company database records.
 * - Abstains when necessary facts are absent from retrieved context.
 * - Currently inactive until native binary, device RAM & licensing are verified.
 * ----------------------------------------------------------------------------
 */

export interface LLMInferenceConfig {
  modelPath?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ILLMProvider {
  isSupportedOnDevice(): Promise<boolean>;
  generateGroundedAnswer(
    systemInstructions: string,
    userQuery: string,
    retrievedLocalContext: string
  ): Promise<string>;
}

export class OptionalOnDeviceLLMProvider implements ILLMProvider {
  private config: LLMInferenceConfig;

  constructor(config: LLMInferenceConfig = { temperature: 0.2, maxTokens: 512 }) {
    this.config = config;
  }

  /**
   * Checks if native hardware acceleration and model weights are ready.
   */
  public async isSupportedOnDevice(): Promise<boolean> {
    // Currently false pending hardware validation & model download confirmation
    return false;
  }

  /**
   * Generates grounded answer using on-device inference model.
   */
  public async generateGroundedAnswer(
    systemInstructions: string,
    userQuery: string,
    retrievedLocalContext: string
  ): Promise<string> {
    const isReady = await this.isSupportedOnDevice();
    if (!isReady) {
      throw new Error(
        'On-device LLM runtime is not loaded. Defaulting to deterministic LocalSearchProvider.'
      );
    }
    // Future integration point for native LiteRT / ExecuTorch C++ bindings
    return `[On-Device AI] ${retrievedLocalContext}`;
  }
}

export const optionalOnDeviceLLMProvider = new OptionalOnDeviceLLMProvider();
