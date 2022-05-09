import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { InstrumentationBase, InstrumentationOption, registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, BufferConfig, ConsoleSpanExporter, SimpleSpanProcessor, Tracer, TracerConfig } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export interface OtelBrowserBatchSpanConfig {
  maxQueueSize : number;
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
  clearTimingResources?: boolean
}

const defaultOptions: OtelBrowserOptions = {
  urlCollector: "http://localhost:4318/v1/traces",
  serviceName: "service_name",
  bufferConfig: {
    maxQueueSize : 100,
    maxExportBatchSize: 10,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
  },
  debugConsole: false,
  fetchInstrumentation: {
    enabled: true,
  },
  documentLoadIntrumentation: true,
}

export class OtelBrowser {
  private _provider: WebTracerProvider;
  private _options: OtelBrowserOptions;
  constructor(options: OtelBrowserOptions) {
    this._options = {
      ...defaultOptions,
      ...options
    }
    const providerOptions: TracerConfig = {
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this._options.serviceName
      }),
    }
    this._provider = new WebTracerProvider(providerOptions);
    const collectorOptions: OTLPExporterNodeConfigBase = {
      url: this._options.urlCollector,
      headers: {},
      concurrencyLimit: 10
    }
    const exporter = new OTLPTraceExporter(collectorOptions);
    const batchSpanProcessor = new BatchSpanProcessor(exporter, this._options.bufferConfig);
    this._provider.addSpanProcessor(batchSpanProcessor);
    if (this._options.debugConsole) {
      const consoleSpanExporter = new ConsoleSpanExporter();
      const consoleSpanProcessor = new SimpleSpanProcessor(consoleSpanExporter);
      this._provider.addSpanProcessor(consoleSpanProcessor);
    }
    this._provider.register({
      contextManager: new ZoneContextManager(),
      propagator: new B3Propagator(),
    })

    const instrumentations:InstrumentationOption[]=[];
    if (this._options.fetchInstrumentation.enabled) {
      const fetchInstrumentation = new FetchInstrumentation(this._options.fetchInstrumentation);
      instrumentations.push(fetchInstrumentation);
    }
    if (this._options.documentLoadIntrumentation) {
      const documentLoadIntrumentation = new DocumentLoadInstrumentation({ enabled: true});
      instrumentations.push(documentLoadIntrumentation as unknown as InstrumentationBase);
    }
    registerInstrumentations({ instrumentations });
  }

  getTracer(keyTracer: string): Tracer {
    return this._provider.getTracer(keyTracer);
  }
  
}


