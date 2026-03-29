export interface Message {
	id?: string;
	sender: string;
	chat: string;
	channel_photo?: string | null;
	text: string;
	timestamp: string;
	media: string | null;
	image?: string | null;
}

export interface GroupedMessages {
	date: string;
	messages: Message[];
}
