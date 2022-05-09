import { BufferConfig, Tracer } from '@opentelemetry/sdk-trace-base';
export interface OtelBrowserBatchSpanConfig {
    maxQueueSize: number;
    maxExportBatchSize: number;
    scheduledDelayMillis: number;
    exportTimeoutMillis: number;
}
export interface OtelBrowserOptions {
    urlCollector: string;
    serviceName: string;
    bufferConfig: BufferConfig;
    debugConsole: boolean;
    fetchInstrumentation: OtelFetchInstrumentation;
    documentLoadIntrumentation: boolean;
}
export interface OtelFetchInstrumentation {
    enabled: boolean;
    ignoreUrls?: (string | RegExp)[];
    propagateTraceHeaderCorsUrls?: (string | RegExp)[];
    clearTimingResources?: boolean;
}
export declare class OtelBrowser {
    private _provider;
    private _options;
    constructor(options: OtelBrowserOptions);
    getTracer(keyTracer: string): Tracer;
}
