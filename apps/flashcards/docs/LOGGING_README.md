# Flashcard Logging System

This system tracks page views and card creation activity for the flashcard application.

## Features

- **IP Tracking**: Logs the IP address of every visitor
- **Page Views**: Tracks when users access the editor page
- **Card Creation**: Logs when users create new flashcards
- **Event Details**: Stores card type, section, and metadata
- **Admin Dashboard**: View logs and statistics

## Setup

### 1. Set Your Admin Token

Edit `api/log.py` and replace `YOUR_SECRET_TOKEN_HERE` with your own secret token:

```python
if auth_token != 'Bearer YOUR_SECRET_TOKEN_HERE':
```

**Important**: Keep this token secret! It protects access to your logs.

### 2. Access the Admin Dashboard

Visit: `https://your-domain.com/flashcards/admin.html`

Enter your admin token to view:
- Total events logged
- Page views count
- Cards created count
- Unique IP addresses
- Detailed log entries

## API Endpoints

### POST /api/log
Log a new event

**Request:**
```json
{
  "event_type": "page_view",
  "data": {
    "page": "editor",
    "referrer": "https://..."
  }
}
```

**Response:**
```json
{
  "status": "logged",
  "timestamp": "2025-11-12T12:00:00"
}
```

### GET /api/logs
Retrieve logs (requires authentication)

**Headers:**
```
Authorization: Bearer YOUR_SECRET_TOKEN
```

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)
- `event_type` (optional): Filter by event type (page_view, card_created, card_edited)

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2025-11-12T12:00:00",
      "event_type": "card_created",
      "ip": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "data": {
        "card_type": "flashcard",
        "section": "ML/Algorithms/K-NN",
        "card_id": "1.1"
      }
    }
  ],
  "count": 1
}
```

### GET /api/logs/stats
Get aggregate statistics (requires authentication)

**Response:**
```json
{
  "stats": {
    "total_events": 150,
    "page_views": 100,
    "card_creations": 45,
    "card_edits": 5,
    "unique_ips": 25,
    "event_types": {
      "page_view": 100,
      "card_created": 45,
      "card_edited": 5
    }
  }
}
```

## Event Types

### page_view
Logged when a user visits the editor page

**Data:**
- `page`: Page name
- `referrer`: Referring URL

### card_created
Logged when a user generates markdown for a new card

**Data:**
- `card_type`: flashcard, quiz, or review
- `section`: Section/topic path
- `card_id`: Unique card identifier
- `markdown_length`: Length of generated markdown

### card_edited
Reserved for future use when edit functionality is added

## Log Storage

- Logs are stored in `/tmp/flashcard_logs.jsonl` on Vercel
- Each line is a JSON object representing one event
- Logs persist during the serverless function lifetime
- **Note**: Vercel's `/tmp` is ephemeral and may be cleared periodically

### For Production

Consider upgrading to a persistent storage solution:
- **Vercel KV** (Redis-based key-value store)
- **Supabase** (PostgreSQL database)
- **MongoDB Atlas** (NoSQL database)
- **AWS S3** (File storage)

## Privacy & Security

1. **Admin Token**: Keep your admin token secret
2. **IP Addresses**: Be aware of privacy regulations (GDPR, CCPA)
3. **Data Retention**: Implement a policy for how long to keep logs
4. **User Consent**: Consider adding a privacy notice on the editor page

## Troubleshooting

### Logs not appearing
- Check that the API endpoint is working: `/api/log`
- Verify the admin token is correct
- Check browser console for errors

### Empty logs
- The `/tmp` directory may have been cleared
- This is normal on Vercel - logs are not permanently stored

### Authentication errors
- Make sure you're using the correct admin token
- Token must include "Bearer " prefix in the Authorization header

## Future Enhancements

- Add edit tracking when cards are modified
- Export logs to CSV/JSON
- Email notifications for suspicious activity
- Dashboard charts and graphs
- IP geolocation
- User session tracking
