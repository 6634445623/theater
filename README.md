# ⚙️ Starting

```bash
# Backend
cd ./backend/
npm install
npm run setup-mock
npm start

# Frontend
cd ./frontend/
npm install
npm run build
npm start
```

# 🎟️ Movie Booking Database Schema Documentation

## 🧑‍💼 `user`
Stores user credentials and role.

| Column     | Type     | Constraints               |
|------------|----------|---------------------------|
| id         | INTEGER  | PRIMARY KEY AUTOINCREMENT |
| username   | TEXT     | NOT NULL, UNIQUE          |
| password   | TEXT     | NOT NULL                  |
| is_admin   | INTEGER  | DEFAULT 0 (boolean flag)  |

**Indexes:**  
- `idx_user_username` on `username`

---

## 🏢 `theatre`
Represents a cinema theatre.

| Column | Type     | Constraints               |
|--------|----------|---------------------------|
| id     | INTEGER  | PRIMARY KEY AUTOINCREMENT |
| name   | TEXT     | NOT NULL                  |

**Indexes:**  
- `idx_theatre_name` on `name`

---

## 🎬 `movie`
Details about the movies.

| Column       | Type     | Constraints               |
|--------------|----------|---------------------------|
| id           | INTEGER  | PRIMARY KEY AUTOINCREMENT |
| name         | TEXT     | NOT NULL                  |
| poster       | TEXT     | NOT NULL (image path/URL) |
| description  | TEXT     |                           |
| duration     | INTEGER  | NOT NULL (in minutes)     |
| rating       | REAL     |                           |
| release_date | TEXT     |                           |

**Indexes:**  
- `idx_movie_name` on `name`

---

## 🗂️ `zone`
Zone within a theatre (e.g., VIP, Regular).

| Column      | Type     | Constraints                       |
|-------------|----------|-----------------------------------|
| id          | INTEGER  | PRIMARY KEY AUTOINCREMENT         |
| name        | TEXT     | NOT NULL                          |
| theatre_id  | INTEGER  | FOREIGN KEY → `theatre(id)`       |

**Indexes:**  
- `idx_zone_theatre` on `theatre_id`

---

## 🗓️ `schedule`
Movie showtimes and availability.

| Column       | Type     | Constraints                             |
|--------------|----------|-----------------------------------------|
| id           | INTEGER  | PRIMARY KEY AUTOINCREMENT               |
| movie_id     | INTEGER  | FOREIGN KEY → `movie(id)`               |
| theatre_id   | INTEGER  | FOREIGN KEY → `theatre(id)`             |
| date         | TEXT     | NOT NULL (YYYY-MM-DD)                   |
| start_time   | TEXT     | NOT NULL (HH:MM)                        |
| available    | INTEGER  | DEFAULT 1 (1 = available, 0 = inactive) |

**Indexes:**  
- `idx_schedule_movie`, `idx_schedule_theatre`, `idx_schedule_date`

---

## 💺 `seat`
Seats in the theatre, tied to a zone.

| Column      | Type     | Constraints                           |
|-------------|----------|---------------------------------------|
| id          | INTEGER  | PRIMARY KEY AUTOINCREMENT             |
| row         | INTEGER  | NOT NULL                              |
| column      | INTEGER  | NOT NULL                              |
| zone_id     | INTEGER  | FOREIGN KEY → `zone(id)`              |
| theatre_id  | INTEGER  | FOREIGN KEY → `theatre(id)`           |
| is_reserve  | INTEGER  | DEFAULT 0 (1 = reserved)              |
| is_spacer   | INTEGER  | DEFAULT 0 (1 = spacer/empty seat)     |

**Indexes:**  
- `idx_seat_zone`, `idx_seat_theatre`, `idx_seat_location` (`row`, `column`)

---

## 🎫 `ticket`
Tickets tied to seat, schedule, and optionally a user.

| Column       | Type     | Constraints                                                   |
|--------------|----------|---------------------------------------------------------------|
| id           | INTEGER  | PRIMARY KEY AUTOINCREMENT                                     |
| user_id      | INTEGER  | NULLABLE, FOREIGN KEY → `user(id)`                            |
| seat_id      | INTEGER  | NOT NULL, FOREIGN KEY → `seat(id)`                            |
| schedule_id  | INTEGER  | NOT NULL, FOREIGN KEY → `schedule(id)`                        |
| status       | TEXT     | CHECK: `available`, `selected`, `booked`; DEFAULT: `available`|
| confirmed    | INTEGER  | DEFAULT 0                                                     |
| created_at   | DATETIME | DEFAULT CURRENT_TIMESTAMP                                     |

**Indexes:**  
- `idx_ticket_user`, `idx_ticket_seat`, `idx_ticket_schedule`, `idx_ticket_status`

---

## 🧾 `receipt`
Payment receipts per user.

| Column         | Type     | Constraints                                                           |
|----------------|----------|-----------------------------------------------------------------------|
| id             | INTEGER  | PRIMARY KEY AUTOINCREMENT                                             |
| user_id        | INTEGER  | NOT NULL, FOREIGN KEY → `user(id)`                                   |
| date           | DATETIME | DEFAULT CURRENT_TIMESTAMP                                             |
| payment_method | TEXT     | NOT NULL, CHECK: `CASH`, `CARD`                                       |

**Indexes:**  
- `idx_receipt_user`, `idx_receipt_date`

---

## 🧾 `receipt_item`
Line items in a receipt, referencing tickets.

| Column      | Type    | Constraints                             |
|-------------|---------|-----------------------------------------|
| id          | INTEGER | PRIMARY KEY AUTOINCREMENT               |
| receipt_id  | INTEGER | FOREIGN KEY → `receipt(id)`             |
| ticket_id   | INTEGER | FOREIGN KEY → `ticket(id)`              |
| price       | REAL    | NOT NULL                                |
| discount    | REAL    | DEFAULT 0                               |
| amount      | INTEGER | DEFAULT 1                               |

**Indexes:**  
- `idx_receipt_item_receipt`, `idx_receipt_item_ticket`

---

## 📦 `bookings`
Aggregated booking record, possibly linked to multiple seats.

| Column         | Type     | Constraints                                 |
|----------------|----------|---------------------------------------------|
| id             | INTEGER  | PRIMARY KEY AUTOINCREMENT                   |
| user_id        | INTEGER  | NOT NULL, FOREIGN KEY → `user(id)`         |
| schedule_id    | INTEGER  | NOT NULL, FOREIGN KEY → `schedule(id)`     |
| total_amount   | REAL     | NOT NULL                                    |
| payment_method | TEXT     | NOT NULL                                    |
| status         | TEXT     | DEFAULT: `pending`                          |
| created_at     | DATETIME | DEFAULT CURRENT_TIMESTAMP                   |

---

## 🪑 `booking_seats`
Stores the seats booked per booking.

| Column     | Type    | Constraints                               |
|------------|---------|-------------------------------------------|
| id         | INTEGER | PRIMARY KEY AUTOINCREMENT                 |
| booking_id | INTEGER | NOT NULL, FOREIGN KEY → `bookings(id)`   |
| row        | TEXT    | NOT NULL                                  |
| number     | TEXT    | NOT NULL                                  |
