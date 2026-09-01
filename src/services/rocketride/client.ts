/**
 * RocketRide Pipeline Orchestration Client Wrapper
 *
 * Connects to the RocketRide AI pipeline runtime (https://github.com/rocketride-org/rocketride-server)
 * for multithreaded OCR, vision, fault classification, and multi-agent pipeline execution.
 *
 * Active Mode: MOCK / DEMO FALLBACK (local RocketRide daemon not detected)
 * When ROCKETRIDE_SERVER_URL is provided and reachable, this wrapper routes requests directly
 * to the RocketRide C++ runtime API / TypeScript SDK.
 */

export interface RocketRideExecutionOptions {
  pipelineDefinitionPath?: string;
  timeoutMs?: number;
  inputPayload: Record<string, unknown>;
}

export interface RocketRidePipelineResult<T = unknown> {
  success: boolean;
  pipelineId: string;
  executionTimeMs: number;
  mode: "MOCK" | "ROCKETRIDE_RUNTIME";
  output: T;
}

export class RocketRideClient {
  private serverUrl: string | null;
  private isMockMode: boolean;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || process.env.ROCKETRIDE_SERVER_URL || null;
    // Default to mock mode if server is not configured/reachable
    this.isMockMode = !this.serverUrl;
  }

  public getMode(): "MOCK" | "ROCKETRIDE_RUNTIME" {
    return this.isMockMode ? "MOCK" : "ROCKETRIDE_RUNTIME";
  }

  /**
   * Execute a portable JSON pipeline definition via RocketRide runtime or high-fidelity mock
   */
  public async executePipeline<T = Record<string, unknown>>(
    pipelineName: string,
    options: RocketRideExecutionOptions
  ): Promise<RocketRidePipelineResult<T>> {
    if (this.isMockMode) {
      // NOTE: Clearly labeled mock pipeline execution for demo environment
      const startTime = Date.now();
      
      // Simulated processing delay to emulate C++ multi-threaded node execution
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        success: true,
        pipelineId: `rr-exec-${Date.now()}`,
        executionTimeMs: Date.now() - startTime,
        mode: "MOCK",
        output: options.inputPayload as T,
      };
    }

    // Live RocketRide runtime execution path
    const response = await fetch(`${this.serverUrl}/v1/pipelines/${pipelineName}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.inputPayload),
    });

    if (!response.ok) {
      throw new Error(`RocketRide runtime error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      pipelineId: data.execution_id,
      executionTimeMs: data.duration_ms,
      mode: "ROCKETRIDE_RUNTIME",
      output: data.result,
    };
  }
}

export const rocketride = new RocketRideClient();
