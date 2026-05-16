import { notificationEmitter, NOTIFICATION_EVENTS } from '@/lib/notifications';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const handler = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      notificationEmitter.on(NOTIFICATION_EVENTS.NEW_BOOKING, handler);
      notificationEmitter.on(NOTIFICATION_EVENTS.TABLE_HOLD, handler);
      notificationEmitter.on(NOTIFICATION_EVENTS.TABLE_RELEASE, handler);

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(': keep-alive\n\n');
      }, 30000);

      req.signal.onabort = () => {
        clearInterval(keepAlive);
        notificationEmitter.off(NOTIFICATION_EVENTS.NEW_BOOKING, handler);
        notificationEmitter.off(NOTIFICATION_EVENTS.TABLE_HOLD, handler);
        notificationEmitter.off(NOTIFICATION_EVENTS.TABLE_RELEASE, handler);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
