import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

function buildTransports(): pino.TransportMultiOptions | pino.TransportSingleOptions | undefined {
  if (isDev) {
    return {
      target: 'pino-pretty',
      options: { colorize: true },
    };
  }

  const axiomToken = process.env.AXIOM_TOKEN;
  const axiomDataset = process.env.AXIOM_DATASET;

  if (axiomToken && axiomDataset) {
    return {
      targets: [
        { target: 'pino/file', options: { destination: 1 } }, // stdout
        {
          target: '@axiomhq/pino',
          options: { dataset: axiomDataset, token: axiomToken },
        },
      ],
    };
  }

  // Production without Axiom — stdout only (no transport needed)
  return undefined;
}

const transport = buildTransports();

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'taboo-web',
    env: process.env.NODE_ENV || 'development',
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || undefined,
  },
  serializers: { err: pino.stdSerializers.err },
  ...(transport ? { transport } : {}),
});

export function createApiLogger(route: string, method: string) {
  return logger.child({ route, method });
}

export function createActionLogger(actionName: string) {
  return logger.child({ action: actionName });
}

export default logger;
