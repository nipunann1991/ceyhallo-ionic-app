
export function getRelativeTime(date: Date): string | null {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Prevent negative diffs (future dates)
  if (diff < 0) return 'Just now';

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // If older than 7 days, return null to signal using standard date format
  if (days > 7) return null; 

  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  return 'Just now';
}
