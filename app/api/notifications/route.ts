import { notificationEmitter, NOTIFICATION_EVENTS } from '@/lib/notifications';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const handler = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      notificationEmitter.on(NOTIFICATION_EVENTS.NEW_BOOKING, handler);
      notificationEmitter.on(NOTIFICATION_EVENTS.TABLE_HOLD, handler);
      notificationEmitter.on(NOTIFICATION_EVENTS.TABLE_RELEASE, handler);

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (e) {
          clearInterval(keepAlive);
        }
      }, 30000);

      req.signal.onabort = () => {
        clearInterval(keepAlive);
        notificationEmitter.off(NOTIFICATION_EVENTS.NEW_BOOKING, handler);
        notificationEmitter.off(NOTIFICATION_EVENTS.TABLE_HOLD, handler);
        notificationEmitter.off(NOTIFICATION_EVENTS.TABLE_RELEASE, handler);
        try { controller.close(); } catch (e) {}
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
