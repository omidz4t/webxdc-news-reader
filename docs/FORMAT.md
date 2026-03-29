# News Batch File Format

This document explains how to make a file for the **News Reader** app. The app can read `.json` files or compressed `.gz` files.

## File Types
You can upload two types of files:
1. **Plain JSON**: A file ending in `.json`.
2. **Compressed JSON**: A file ending in `.gz` (Gzip). This is better for large files.

## Data Structure
The app supports two ways to organize your data:

### 1. Simple Format
A simple list (array) of message objects.

```json
[
  {
    "sender": "BBC News",
    "chat": "BBC World",
    "text": "The latest news from around the world.",
    "timestamp": "2026-03-29T10:00:00Z"
  }
]
```

### 2. Full Format (Recommended)
An object that includes channel information and the list of messages. This is better because it stores channel photos only once.

```json
{
  "channels": {
    "BBC World": {
      "photo": "https://example.com/bbc.png"
    }
  },
  "messages": [
    {
      "id": "msg_001",
      "sender": "BBC News",
      "chat": "BBC World",
      "text": "Testing the [News Reader](https://webxdc.org) app!",
      "timestamp": "2026-03-29T10:00:00Z",
      "image": "https://example.com/news-image.jpg"
    }
  ]
}
```

---

## Message Fields
Each message object can have these fields:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sender` | string | **Yes** | The name of the person or bot who sent it. |
| `chat` | string | **Yes** | The name of the channel (e.g., "BBC News"). |
| `text` | string | **Yes** | The message content. Supports links like `[label](url)`. |
| `timestamp` | string | **Yes** | ISO date format (e.g., `2026-03-29T18:00:00Z`). |
| `id` | string | No | A unique ID for deduplication. |
| `image` | string | No | URL of an image to show in the message. |
| `media` | string | No | Name or link of a file attachment. |
| `channel_photo`| string | No | URL of the channel avatar. |

## Important Notes
- **Deduplication**: If you merge multiple files, the app uses the `id` field to remove duplicate messages. If no `id` is present, it creates one from the sender, timestamp, and text.
- **Sorting**: The app automatically sorts all messages by time.
- **Links**: You can use standard URLs (e.g., `https://google.com`) or Markdown-style links.
