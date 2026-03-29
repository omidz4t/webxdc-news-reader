import type { Message, GroupedMessages } from './types';

export function formatTime(iso: string): string {
	try {
		return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	} catch { return iso; }
}

export function formatDateLabel(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
	} catch { return ''; }
}

export function getInitials(name: string): string {
	return name.slice(0, 2).toUpperCase();
}

export function avatarColor(name: string): string {
	let h = 0;
	if (!name) return 'hsl(0, 0%, 50%)';
	for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
	const hue = Math.abs(h) % 360;
	return `hsl(${hue}, 55%, 45%)`;
}

export function groupByDate(msgs: Message[]): GroupedMessages[] {
	const groups: GroupedMessages[] = [];
	let current: GroupedMessages | null = null;
	for (const msg of msgs) {
		const d = formatDateLabel(msg.timestamp);
		if (!current || current.date !== d) {
			current = { date: d, messages: [] };
			groups.push(current);
		}
		current.messages.push(msg);
	}
	return groups;
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function renderText(text: string): string {
	const linkPattern = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<]+)/g;
	const parts: string[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = linkPattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push(escapeHtml(text.slice(lastIndex, match.index)));
		}

		if (match[2]) {
			const label = match[1].trim();
			const url = match[2];
			const display = label || (() => { try { return new URL(url).hostname; } catch { return url; } })();
			parts.push(`<a href="${escapeHtml(url)}" class="tg-link" data-href="${escapeHtml(url)}">${escapeHtml(display)}</a>`);
		} else if (match[3]) {
			const url = match[3];
			parts.push(`<a href="${escapeHtml(url)}" class="tg-link" data-href="${escapeHtml(url)}">${escapeHtml(url)}</a>`);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		parts.push(escapeHtml(text.slice(lastIndex)));
	}

	return parts.join('');
}

export function getChannelsInfo(msgs: Message[]): { name: string, count: number, photo?: string | null }[] {
	const counts = new Map<string, { count: number, photo: string | null }>();
	for (const msg of msgs) {
		const chat = msg.chat || 'Unknown Channel';
		if (!counts.has(chat)) {
			counts.set(chat, { count: 0, photo: msg.channel_photo || null });
		}
		const info = counts.get(chat)!;
		info.count++;
		// If current info has no photo, but this message does, use it!
		if (!info.photo && msg.channel_photo) {
			info.photo = msg.channel_photo;
		}
	}
	return Array.from(counts.entries())
		.map(([name, info]) => ({ name, count: info.count, photo: info.photo }))
		.sort((a, b) => b.count - a.count);
}
