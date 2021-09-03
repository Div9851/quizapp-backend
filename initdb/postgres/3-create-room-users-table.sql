CREATE TABLE room_users
(
    room_id TEXT,
    user_id TEXT,
    UNIQUE (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);