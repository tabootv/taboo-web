import type { Instrumentation } from 'next';
import logger from '@/shared/lib/logger';

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const digest =
    typeof err === 'object' && err !== null && 'digest' in err
      ? (err as { digest?: string }).digest
      : undefined;

  logger.error(
    {
      err,
      digest,
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routePath: context.routePath,
      renderSource: context.renderSource,
    },
    `Uncaught ${context.routeType} error: ${request.path}`
  );
};
