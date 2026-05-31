import { Notification } from '../models/notification.model';
import { NotificationSource, NotificationType } from '../enums/notification.enum';

type FirestoreLikeTimestamp = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
};

type LooseRecord = Record<string, any>;

function asRecord(value: unknown): LooseRecord {
  if (value && typeof value === 'object') {
    return value as LooseRecord;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as LooseRecord) : {};
    } catch {
      return {};
    }
  }

  return {};
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

function normalizeCollectionName(value: string): string {
  return value.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

function toValidDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof (value as FirestoreLikeTimestamp).toDate === 'function') {
    const date = (value as FirestoreLikeTimestamp).toDate?.();
    return date && !isNaN(date.getTime()) ? date : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1_000_000_000_000 ? value : value * 1000;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value.trim() !== '') {
      return toValidDate(numericValue);
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  const record = asRecord(value);
  if (typeof record.seconds === 'number') {
    return toValidDate(record.seconds);
  }

  return null;
}

function titleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildRouteFromType(type: string, id?: string): string | undefined {
  const normalizedType = type.toLowerCase().trim();
  const normalizedId = id?.trim();

  if (normalizedId) {
    if (normalizedType.includes('business') || normalizedType.includes('organization')) {
      return `/business/${normalizedId}`;
    }
    if (normalizedType.includes('event')) {
      return `/event/${normalizedId}`;
    }
    if (normalizedType.includes('job')) {
      return `/job/${normalizedId}`;
    }
    if (normalizedType.includes('news') || normalizedType.includes('article')) {
      return `/news/${normalizedId}`;
    }
    if (normalizedType.includes('legal')) {
      return `/legal/${normalizedId}`;
    }
  }

  if (normalizedType === 'notifications') {
    return '/notifications';
  }

  if (normalizedType === 'offers' || normalizedType === 'support' || normalizedType === 'news' || normalizedType === 'events' || normalizedType === 'jobs' || normalizedType === 'businesses') {
    return `/${normalizedType}`;
  }

  return undefined;
}

function extractRouteFromObject(value: unknown): string | undefined {
  const record = asRecord(value);
  if (Object.keys(record).length === 0) {
    return undefined;
  }

  const directLink = firstString(
    record['link'],
    record['url'],
    record['path'],
    record['route'],
    record['routeId'],
    record['href'],
    record['redirectTo'],
    record['redirect_to'],
    record['webUrl'],
    record['web_url'],
    record['externalUrl'],
    record['external_url'],
    record['deepLink'],
    record['deep_link'],
    record['clickAction'],
    record['click_action']
  );

  const normalizedDirectLink = normalizeNotificationLink(directLink);
  if (normalizedDirectLink) {
    return normalizedDirectLink;
  }

  const targetType = firstString(
    record['targetType'],
    record['entityType'],
    record['collection'],
    record['kind'],
    record['type']
  );

  const targetId = firstString(
    record['targetId'],
    record['entityId'],
    record['resourceId'],
    record['itemId'],
    record['id']
  );

  if (targetType) {
    return buildRouteFromType(targetType, targetId);
  }

  return undefined;
}

export function normalizeNotificationLink(rawLink?: string): string | undefined {
  if (!rawLink) {
    return undefined;
  }

  if (/^https?:\/\//i.test(rawLink)) {
    return rawLink;
  }

  let link = rawLink.trim();

  if (!link) {
    return undefined;
  }

  if (link.startsWith('/#')) {
    link = link.slice(2);
  } else if (link.startsWith('#')) {
    link = link.slice(1);
  }

  if (!link.startsWith('/')) {
    link = `/${link}`;
  }

  return link.replace(/\/{2,}/g, '/');
}

export function extractNotificationLink(data: LooseRecord): string | undefined {
  const nestedNotification = asRecord(data['notification']);
  const nestedData = asRecord(data['data']);
  const payload = asRecord(data['payload']);
  const payloadNotification = asRecord(payload['notification']);
  const payloadData = asRecord(payload['data']);

  const routeFromObjects =
    extractRouteFromObject(data['link']) ||
    extractRouteFromObject(data['route']) ||
    extractRouteFromObject(data['navigation']) ||
    extractRouteFromObject(data['redirect']) ||
    extractRouteFromObject(nestedNotification) ||
    extractRouteFromObject(nestedData) ||
    extractRouteFromObject(payload['link']) ||
    extractRouteFromObject(payload['route']) ||
    extractRouteFromObject(payload['navigation']) ||
    extractRouteFromObject(payloadNotification['link']) ||
    extractRouteFromObject(payloadNotification['route']) ||
    extractRouteFromObject(payloadData['link']) ||
    extractRouteFromObject(payloadData['route']) ||
    extractRouteFromObject(payloadData['navigation']);

  if (routeFromObjects) {
    return routeFromObjects;
  }

  const directLink = firstString(
    data['link'],
    data['route'],
    data['routeId'],
    data['path'],
    data['url'],
    data['href'],
    data['redirectTo'],
    data['redirect_to'],
    data['webUrl'],
    data['web_url'],
    data['externalUrl'],
    data['external_url'],
    data['deepLink'],
    data['deep_link'],
    data['deeplink'],
    data['screen'],
    data['actionTarget'],
    data['actionValue'],
    nestedNotification['link'],
    nestedNotification['route'],
    nestedNotification['routeId'],
    nestedNotification['path'],
    nestedNotification['url'],
    nestedNotification['deepLink'],
    nestedNotification['deep_link'],
    nestedNotification['clickAction'],
    nestedNotification['click_action'],
    nestedData['link'],
    nestedData['route'],
    nestedData['routeId'],
    nestedData['path'],
    nestedData['url'],
    nestedData['deepLink'],
    nestedData['deep_link'],
    nestedData['deeplink'],
    nestedData['clickAction'],
    nestedData['click_action'],
    payload['link'],
    payload['route'],
    payload['routeId'],
    payload['path'],
    payload['url'],
    payload['href'],
    payload['redirectTo'],
    payload['redirect_to'],
    payload['webUrl'],
    payload['web_url'],
    payload['externalUrl'],
    payload['external_url'],
    payload['deepLink'],
    payload['deeplink'],
    payloadData['link'],
    payloadData['route'],
    payloadData['routeId'],
    payloadData['path'],
    payloadData['url'],
    payloadData['href'],
    payloadData['redirectTo'],
    payloadData['redirect_to'],
    payloadData['webUrl'],
    payloadData['web_url'],
    payloadData['externalUrl'],
    payloadData['external_url'],
    payloadData['deepLink'],
    payloadData['deeplink'],
    payloadData['clickAction'],
    payloadData['click_action'],
    payloadNotification['clickAction'],
    payloadNotification['click_action']
  );

  const normalizedDirectLink = normalizeNotificationLink(directLink);
  if (normalizedDirectLink) {
    return normalizedDirectLink;
  }

  const targetId = firstString(
    data['targetId'],
    data['entityId'],
    data['resourceId'],
    data['itemId'],
    nestedData['targetId'],
    nestedData['entityId'],
    nestedData['resourceId'],
    nestedData['itemId'],
    payload['targetId'],
    payloadData['targetId'],
    payloadData['entityId'],
    payloadData['resourceId'],
    payloadData['itemId']
  );

  const targetType = firstString(
    data['targetType'],
    data['entityType'],
    data['collection'],
    data['kind'],
    nestedData['targetType'],
    nestedData['entityType'],
    nestedData['collection'],
    nestedData['kind'],
    payload['targetType'],
    payloadData['targetType'],
    payloadData['entityType'],
    payloadData['collection'],
    payloadData['kind']
  );

  if (targetType) {
    return buildRouteFromType(targetType, targetId);
  }

  return undefined;
}

export function extractNotificationDate(data: LooseRecord): Date | null {
  const payload = asRecord(data['payload']);
  const payloadData = asRecord(payload['data']);

  const candidates = [
    data['date'],
    data['createdAt'],
    data['created_at'],
    data['updatedAt'],
    data['updated_at'],
    data['sentAt'],
    data['sent_at'],
    data['queuedAt'],
    data['queued_at'],
    data['scheduledAt'],
    data['scheduled_at'],
    data['timestamp'],
    data['publishedAt'],
    payload['date'],
    payload['createdAt'],
    payload['updatedAt'],
    payload['sentAt'],
    payload['queuedAt'],
    payload['timestamp'],
    payloadData['date'],
    payloadData['createdAt'],
    payloadData['updatedAt'],
    payloadData['sentAt'],
    payloadData['queuedAt'],
    payloadData['timestamp']
  ];

  for (const candidate of candidates) {
    const parsedDate = toValidDate(candidate);
    if (parsedDate) {
      return parsedDate;
    }
  }

  return null;
}

function inferNotificationType(rawType?: string, rawStatus?: string): NotificationType {
  const value = (rawType || rawStatus || '').toLowerCase();

  if (value.includes('error') || value.includes('alert') || value.includes('fail') || value.includes('denied')) {
    return NotificationType.Alert;
  }

  if (value.includes('warn') || value.includes('queue') || value.includes('pending') || value.includes('scheduled')) {
    return NotificationType.Warning;
  }

  if (value.includes('success') || value.includes('sent') || value.includes('deliver') || value.includes('complete') || value.includes('read')) {
    return NotificationType.Success;
  }

  return NotificationType.Info;
}

export function mapNotificationDocument(id: string, data: LooseRecord, source: NotificationSource): Notification | null {
  const payload = asRecord(data['payload']);
  const payloadNotification = asRecord(payload['notification']);
  const payloadData = asRecord(payload['data']);
  const date = extractNotificationDate(data);

  if (!date) {
    return null;
  }

  const status = firstString(
    data['status'],
    data['deliveryStatus'],
    data['state'],
    payload['status'],
    payloadData['status']
  );

  const rawType = firstString(
    data['type'],
    data['level'],
    data['severity'],
    data['variant'],
    payload['type'],
    payloadData['type']
  );

  return {
    id: `${source}:${id}`,
    title: firstString(
      data['title'],
      data['header'],
      data['subject'],
      payloadNotification['title'],
      payloadData['title'],
      payload['title']
    ) || 'Notification',
    message: firstString(
      data['message'],
      data['body'],
      data['description'],
      payloadNotification['body'],
      payloadData['message'],
      payloadData['body'],
      payload['body']
    ) || '',
    date,
    read: data['read'] ?? false,
    type: inferNotificationType(rawType, status),
    source,
    sourceLabel: source === NotificationSource.Queue ? 'Queue' : 'Feed',
    status: status ? normalizeCollectionName(status) : undefined,
    statusLabel: status ? titleCase(status) : undefined,
    link: extractNotificationLink(data)
  };
}
