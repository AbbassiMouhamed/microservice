# Messaging Service

Real-time chat with WebSocket, chatbot, translation, and video call signaling.

## What It Does

- **Conversations** — create and manage chat threads
- **Real-time messaging** via WebSocket (STOMP protocol)
- **Chatbot** — automated responses
- **Translation** — translate messages between languages
- **User presence** — online/offline status
- **Invitations** — invite users to conversations
- **Block** — block/unblock users
- **Video calls** — WebRTC signaling (offer, answer, ICE candidates)

## API Endpoints

| Method | Path                           | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/api/messaging/conversations` | List conversations  |
| POST   | `/api/messaging/messages`      | Send a message      |
| GET    | `/api/messaging/messages`      | Get messages        |
| GET    | `/api/messaging/users`         | List users          |
| GET    | `/api/messaging/presence`      | Get presence status |
| POST   | `/api/messaging/invitations`   | Send invitation     |
| POST   | `/api/messaging/chatbot`       | Chat with bot       |
| POST   | `/api/messaging/translate`     | Translate text      |
| POST   | `/api/messaging/block`         | Block a user        |

### WebSocket

Connect to `/ws-messaging` and use STOMP:

| Destination                    | Description    |
| ------------------------------ | -------------- |
| `/app/chat.sendMessage`        | Send a message |
| `/app/chat.markAsRead`         | Mark as read   |
| `/app/call.offer/{id}`         | Start a call   |
| `/app/call.answer/{id}`        | Answer a call  |
| `/app/call.ice-candidate/{id}` | ICE candidate  |
| `/app/call.end/{id}`           | End a call     |

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8085 |
| Local       | 8085 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl messaging-service spring-boot:run
```

Swagger UI: http://localhost:8085/swagger-ui

## Tech

- Spring Boot (Web, WebSocket, JPA, Security)
- STOMP over WebSocket
- MySQL + Flyway migrations
- Eureka Client
