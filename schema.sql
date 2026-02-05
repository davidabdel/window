
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    businessName TEXT,
    email TEXT UNIQUE,
    abn TEXT,
    password TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    name TEXT,
    address TEXT,
    phone TEXT,
    customer_email TEXT,
    defaultPrice REAL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    customerId TEXT,
    description TEXT,
    amount REAL,
    notes TEXT,
    status TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    customerId TEXT,
    quoteId TEXT,
    description TEXT,
    scheduledDate TEXT,
    price REAL,
    notes TEXT,
    status TEXT,
    completedAt TEXT,
    recurrence TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
