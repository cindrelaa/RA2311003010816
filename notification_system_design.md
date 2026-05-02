# Stage 1

## REST API Design

### 1. Get Notifications
GET /notifications

Headers:
Authorization: Bearer <token>

Response:
{
  "notifications": [
    {
      "id": "1",
      "type": "Placement",
      "message": "Company XYZ hired students",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30"
    }
  ]
}

---

### 2. Mark Notification as Read
POST /notifications/read

Headers:
Authorization: Bearer <token>

Request:
{
  "notificationId": "1"
}

Response:
{
  "success": true
}

---

### 3. Create Notification
POST /notifications

Headers:
Authorization: Bearer <token>

Request:
{
  "studentId": 1042,
  "type": "Placement",
  "message": "New placement opportunity"
}

Response:
{
  "success": true
}

---

## Real-Time Notifications

Real-time notifications can be implemented using:
- WebSockets  
- Server-Sent Events (SSE)  

This allows instant delivery of notifications without refreshing the page.

---

# Stage 2

## Database Choice

PostgreSQL is chosen because:
- Structured data  
- Strong querying capabilities  
- Reliable for large datasets  

---

## Schema Design

Table: notifications

- id (UUID, Primary Key)  
- studentId (INT)  
- type (ENUM: Placement, Result, Event)  
- message (TEXT)  
- isRead (BOOLEAN)  
- createdAt (TIMESTAMP)  

---

## Sample Queries

Fetch notifications:
SELECT * FROM notifications WHERE studentId = 1042;

Mark as read:
UPDATE notifications SET isRead = true WHERE id = '1';

---

## Scaling Issues

- Increase in data volume  
- Slow query performance  
- High read traffic  

---

## Solutions

- Indexing  
- Partitioning  
- Caching using Redis  

---

# Stage 3

## Problem with Query

SELECT * FROM notifications  
WHERE studentId = 1042 AND isRead = false  
ORDER BY createdAt DESC;  

This query becomes slow because:
- No index on filtering columns  
- Full table scan occurs  

---

## Solution

Create index:

CREATE INDEX idx_student_read  
ON notifications(studentId, isRead, createdAt DESC);

---

## Improved Query

SELECT * FROM notifications  
WHERE studentId = 1042 AND isRead = false  
ORDER BY createdAt DESC;

---

## Note on Indexing

Adding indexes on every column is not efficient because:
- Increases storage  
- Slows down insert operations  

---

## Additional Query

Find students with placement notifications in last 7 days:

SELECT DISTINCT studentId  
FROM notifications  
WHERE type = 'Placement'  
AND createdAt >= NOW() - INTERVAL '7 days';

---

# Stage 4

## Problem

Fetching notifications on every page load increases DB load and slows performance.

---

## Solutions

1. Caching (Redis)  
   - Store frequently accessed notifications  
   - Reduces DB queries  

2. Pagination  
   - Use LIMIT and OFFSET  
   - Fetch only required data  

3. Lazy Loading  
   - Load notifications as user scrolls  

---

## Tradeoffs

- Caching improves speed but adds complexity  
- Pagination reduces load but increases API calls  
- Lazy loading improves UX but needs frontend support  

---

# Stage 5

## Problems in Given Implementation

- Email sending failure not handled  
- Sequential processing is slow  
- No retry mechanism  
- Tight coupling between DB and email  

---

## Improved Design

- Use message queue (Kafka/RabbitMQ)  
- Decouple email and DB operations  
- Add retry mechanism  

---

## Revised Flow

1. Save notification to DB  
2. Push message to queue  
3. Worker processes queue  
4. Sends email and push notification  

---

## Improved Pseudocode

function notify_all(student_ids, message):
  for id in student_ids:
    save_to_db(id, message)
    push_to_queue(id, message)

---

# Stage 6

## Code Implementation (JavaScript)

function getTopNotifications(notifications) {
  const priority = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  return notifications
    .sort((a, b) => {
      if (priority[b.type] !== priority[a.type]) {
        return priority[b.type] - priority[a.type];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .slice(0, 10);
}

---

## Explanation

- Notifications are sorted by priority (Placement > Result > Event)  
- If priorities are equal, they are sorted by recency  
- Top 10 notifications are returned  

---

## Handling Continuous Updates

To maintain top notifications efficiently:
- Use a priority queue (heap)  
- Insert new notifications dynamically  
- Keep only top N elements  

This ensures efficient updates without sorting entire data repeatedly.
