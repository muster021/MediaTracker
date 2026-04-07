import { GetCalendarItemsResponse } from 'src/controllers/calendar';

const escapeIcal = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

const formatIcalDate = (dateStr: string): string => {
  return dateStr.substring(0, 10).replace(/-/g, '');
};

const nextDay = (dateStr: string): string => {
  // RFC 5545: DTEND for DATE-only events is exclusive — must be day after
  const d = new Date(dateStr.substring(0, 10) + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().substring(0, 10).replace(/-/g, '');
};

const foldLine = (line: string): string => {
  // RFC 5545 §3.1: fold lines longer than 75 octets
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const result: string[] = [];
  let offset = 0;
  let first = true;
  while (offset < bytes.length) {
    const chunk = first ? 75 : 74; // continuation lines start with a space (1 byte)
    result.push(bytes.slice(offset, offset + chunk).toString('utf8'));
    offset += chunk;
    first = false;
  }
  return result.join('\r\n ');
};

export const generateIcal = (
  items: GetCalendarItemsResponse,
  baseUrl?: string
): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MediaTracker//TV Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:TV series',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const item of items) {
    if (!item.episode || !item.episode.releaseDate) {
      continue;
    }

    const { mediaItem, episode } = item;

    const season = String(episode.seasonNumber).padStart(2, '0');
    const ep = String(episode.episodeNumber).padStart(2, '0');
    const summary = episode.title
      ? `${mediaItem.title} S${season}E${ep} - ${episode.title}`
      : `${mediaItem.title} S${season}E${ep}`;

    const uid = `mediatracker-ep-${episode.id}@mediatracker`;
    const dtstart = formatIcalDate(episode.releaseDate);
    const dtend = nextDay(episode.releaseDate);

    const descParts = [
      `Season ${episode.seasonNumber}, Episode ${episode.episodeNumber}`,
    ];
    if (episode.seen) {
      descParts.push('Seen');
    }
    const description = escapeIcal(descParts.join(' | '));

    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${uid}`));
    lines.push(foldLine(`SUMMARY:${escapeIcal(summary)}`));
    lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
    lines.push(`DTEND;VALUE=DATE:${dtend}`);
    lines.push(foldLine(`DESCRIPTION:${description}`));
    if (baseUrl && mediaItem.id) {
      lines.push(foldLine(`URL:${baseUrl}/#/details/${mediaItem.id}`));
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
};
