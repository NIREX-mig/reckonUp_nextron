import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import fs from "node:fs";

const isProd = process.env.NODE_ENV === "production";

let dbDir: string | undefined;

if (isProd) {
  dbDir = path.join(`app.getPath('userData')`, "DB");
} else {
  dbDir = path.join(`${app.getPath("userData")} (development)`, "DB");
}

// Ensure DB directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const configDBPath = path.join(dbDir, "config.sqlite");
const dataDBPath = path.join(dbDir, "database.sqlite");

let configDB: Database.Database | undefined;
let dataDB: Database.Database | undefined;

try {
  // Initialize the databases
  configDB = new Database(configDBPath);
  dataDB = new Database(dataDBPath);

  // User Table (configDB)
  configDB.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      forgotOtpHash TEXT,
      otpValidation TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings Table (configDB)
  configDB.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      qrPath TEXT,
      GSTNO TEXT NOT NULL DEFAULT 'Not Available',
      address TEXT NOT NULL DEFAULT 'Not Available',
      mobileNo TEXT NOT NULL DEFAULT 'Not Available',
      ownerName TEXT NOT NULL DEFAULT 'Not Available',
      whatsappNo TEXT NOT NULL DEFAULT 'Not Available',
      shopName TEXT NOT NULL DEFAULT 'Not Available',
      logoPath TEXT
    );
  `);

  // Invoices Table (dataDB)
  dataDB.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      invoiceNo TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      exchange TEXT NOT NULL,
      exchangeCategory TEXT NOT NULL,
      exchangeWeight REAL NOT NULL,
      exchangePercentage REAL NOT NULL,
      exchangeAmount REAL NOT NULL,
      gst TEXT NOT NULL,
      gstPercentage REAL NOT NULL,
      gstAmount REAL NOT NULL,
      discount INTEGER NOT NULL,
      grossAmount INTEGER NOT NULL,
      totalAmount INTEGER NOT NULL,
      dueAmount INTEGER NOT NULL,
      paymentStatus TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Products Table (dataDB)
  dataDB.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      weight REAL NOT NULL,
      quantity INTEGER NOT NULL,
      rate INTEGER NOT NULL,
      amount REAL NOT NULL,
      makingCost REAL NOT NULL,
      FOREIGN KEY (invoiceId) REFERENCES invoices(invoiceNo)
    );
  `);

  // Payments Table (dataDB)
  dataDB.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceId TEXT NOT NULL,
      paidAmount INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoiceId) REFERENCES invoices(invoiceNo)
    );
  `);

  console.log("SQLite databases initialized successfully.");
} catch (error) {
  console.error("Failed to initialize database:", error);
  configDB = undefined;
  dataDB = undefined;
  throw new Error("Failed to initialize SQLite databases.");
}

export { configDB, dataDB };
