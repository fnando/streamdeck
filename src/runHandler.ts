export function runHandler<T>(
  target: T,
  data: { event: string; payload: Record<string, unknown> },
) {
  const event = data.event as string;
  const handlerName = `handle${event[0].toUpperCase()}${event.substring(1)}`;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const handler = target[handlerName];

  if (handler) {
    handler.call(target, { event: data.event, ...data.payload });
    return;
  }
}
