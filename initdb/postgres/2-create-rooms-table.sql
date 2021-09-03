CREATE TABLE rooms
(
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);