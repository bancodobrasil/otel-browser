import { context, trace } from '@opentelemetry/api';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations, InstrumentationBase } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';

const providerOptions = {
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-demo',
  }),
}
const provider = new WebTracerProvider(providerOptions);

const collectorOptions = {
  url: 'http://localhost:4318/v1/traces',
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on pending requests
};

const exporter = new OTLPTraceExporter(collectorOptions);

const batchSpanConfig = {
  // The maximum queue size. After the size is reached spans are dropped.
  maxQueueSize: 100,
  // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
  maxExportBatchSize: 10,
  // The interval between two consecutive exports
  scheduledDelayMillis: 5000,
  // How long the export can run before it is cancelled
  exportTimeoutMillis: 30000,
}

// Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
// to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
// exporter without delay
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new BatchSpanProcessor(exporter, batchSpanConfig));
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://cors-test.appspot.com/test',
        'https://httpbin.org/get',
      ],
      clearTimingResources: true,
    }),
    new DocumentLoadInstrumentation({
      enabled: true,
    }) as unknown as InstrumentationBase
  ],
});

const webTracerWithZone = provider.getTracer('example-tracer-web');

const getData = (url: string) => fetch(url, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    const singleSpan = webTracerWithZone.startSpan('files-series-info');
    context.with(trace.setSpan(context.active(), singleSpan), () => {
      getData(url).then((_data) => {
        trace.getSpan(context.active())?.addEvent('fetching-single-span-completed');
        singleSpan.end();
      });
    });
    for (let i = 0, j = 5; i < j; i += 1) {
      const span = webTracerWithZone.startSpan(`files-series-info-${i}`);
      context.with(trace.setSpan(context.active(), span), () => {
        getData(url).then((_data) => {
          trace.getSpan(context.active())?.addEvent(`fetching-span-${i}-completed`);
          span.end();
        });
      });
    }
  };
  element?.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);
