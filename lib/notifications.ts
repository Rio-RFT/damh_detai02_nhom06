import { EventEmitter } from 'events';

// Global singleton for notifications (works in local dev)
class NotificationEmitter extends EventEmitter {}

if (!(global as any).notificationEmitter) {
  (global as any).notificationEmitter = new NotificationEmitter();
}

export const notificationEmitter = (global as any).notificationEmitter as NotificationEmitter;

export const NOTIFICATION_EVENTS = {
  NEW_BOOKING: 'NEW_BOOKING',
  TABLE_HOLD: 'TABLE_HOLD',
  TABLE_RELEASE: 'TABLE_RELEASE',
};
