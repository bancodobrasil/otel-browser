import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
const defaultOptions = {
    urlCollector: "http://localhost:4318/v1/traces",
    serviceName: "service_name",
    bufferConfig: {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 5000,
        exportTimeoutMillis: 30000,
    },
    debugConsole: false,
    fetchInstrumentation: {
        enabled: true,
    },
    documentLoadIntrumentation: true,
};
export class OtelBrowser {
    constructor(options) {
        this._options = Object.assign(Object.assign({}, defaultOptions), options);
        const providerOptions = {
            resource: new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: this._options.serviceName
            }),
        };
        this._provider = new WebTracerProvider(providerOptions);
        const collectorOptions = {
            url: this._options.urlCollector,
            headers: {},
            concurrencyLimit: 10
        };
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
        });
        const instrumentations = [];
        if (this._options.fetchInstrumentation.enabled) {
            const fetchInstrumentation = new FetchInstrumentation(this._options.fetchInstrumentation);
            instrumentations.push(fetchInstrumentation);
        }
        if (this._options.documentLoadIntrumentation) {
            const documentLoadIntrumentation = new DocumentLoadInstrumentation({ enabled: true });
            instrumentations.push(documentLoadIntrumentation);
        }
        registerInstrumentations({ instrumentations });
    }
    getTracer(keyTracer) {
        return this._provider.getTracer(keyTracer);
    }
}
