import env from 'dotenv';
env.config();

import path from 'path';
import { app, ipcMain, dialog, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { ConvertIntoArray, createWindow, genrateOtp } from './helpers';
import EventResponse from './helpers/EventResponse';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendForgotPasswordEmail, { sendFeedbackEmail } from './helpers/sendEmail';
import fs from 'node:fs';
import { autoUpdater } from 'electron-updater';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { configDB, dataDB } from './helpers/sqllite/db';
import {
  startOfToday,
  subDays,
  formatISO,
  format,
  parseISO,
  startOfYear,
  endOfYear,
  subMonths,
  isAfter,
  addDays,
  startOfMonth,
  setMonth,
  setYear,
  endOfMonth,
} from 'date-fns';

// Basic flags for Electron updater
autoUpdater.autoDownload = false;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

async function checkUserIsExistOrNot() {
  try {
    const stmt = configDB.prepare('SELECT * FROM users WHERE username = ?');
    const existedUser = stmt.get('app-admin');

    if (!existedUser) {
      const salt = await bcrypt.genSalt(10);
      const newpassword = await bcrypt.hash('12345', salt);

      const insertStmt = configDB.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      );
      insertStmt.run('app-admin', 'akay93796@gmail.com', newpassword);
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
  }
}

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const appDataPath = app.getPath('userData');
const uploadPath = path.join(appDataPath, 'Assets');

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

(async () => {
  await app.whenReady();

  // check user is existed or not if not it create user
  await checkUserIsExistOrNot();

  // Create the splash screen
  splashWindow = new BrowserWindow({
    width: 720,
    height: 480,
    frame: false,
    backgroundColor: '#f9f7fd',
    roundedCorners: true,
    // alwaysOnTop: true,
    transparent: true,
    center: true,
    resizable: false,
  });

  mainWindow = createWindow('main', {
    title: 'ReckonUp - Devloped by NIreX',
    width: 1366,
    height: 768,
    show: false, // Hide initially
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.removeMenu();
  mainWindow.center();
  mainWindow.setMinimumSize(1366, 768);

  // Intercept the close event
  mainWindow.on('close', (e) => {
    // Prevent the window from closing immediately
    e.preventDefault();

    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Cancel', 'Yes'],
      defaultId: 0,
      cancelId: 0,
      title: 'Confirm Exit',
      message: 'Are you sure you want to quit?',
    });

    if (choice === 1) {
      // Remove the close listener before closing
      mainWindow.removeAllListeners('close');
      mainWindow.close();
    }
    // Otherwise, do nothing (prevent closing)
  });

  if (isProd) {
    await splashWindow.loadURL('app://./SplashScreen');
    await mainWindow.loadURL('app://./home');
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    const port = process.argv[2];
    await splashWindow.loadURL(`http://localhost:${port}/SplashScreen`);
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  // Show the main window after splash screen timeout
  setTimeout(() => {
    if (splashWindow) {
      splashWindow.close();
    }
    if (mainWindow) {
      mainWindow.show();
    }
  }, 3000);
})();

app.on('window-all-closed', () => {
  app.quit();
});

/*------------------------------
    Auto Update Section 
-------------------------------*/

autoUpdater.on('update-available', () => {
  const dialogOpts: any = {
    type: 'info',
    buttons: ['Ok'],
    title: 'Application Update',
    message: 'New Update Avilable',
    detail: 'ReckonUp have new Update Released',
  };
  dialog.showMessageBox(mainWindow, dialogOpts).then(() => {
    autoUpdater.downloadUpdate();
  });
});

autoUpdater.on('update-downloaded', () => {
  const dialogOpts: any = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'Update Download Successfully',
    detail: 'A new version has been downloaded. Restart the application to apply the updates.',
  };
  dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// Expose events using IPC
// -----------------------------
//     User Events
// -----------------------------

ipcMain.on('login', async (event, args) => {
  try {
    // Find the user
    const stmt = configDB.prepare('SELECT * FROM users WHERE username = ?');
    const user: any = stmt.get(args.username);

    if (!user) {
      throw new EventResponse(false, 'Invalid Credential!', {});
    }

    // Check the password
    const isPasswordCorrect = await bcrypt.compare(args.password, user.password);
    if (!isPasswordCorrect) {
      throw new EventResponse(false, 'Invalid Credential!', {});
    }

    // Create response and emit event
    const response = new EventResponse(true, 'Login successfully.', user);
    event.reply('login', response);
  } catch (err) {
    event.reply('login', err);
  }
});

// ForgotPassword email send Event
ipcMain.on('forgotpasswordemail', async (event, args) => {
  try {
    const { username } = await args;

    // Find the user
    const stmt = configDB.prepare('SELECT * FROM users WHERE username = ?');
    const user: any = stmt.get(username);

    if (!user) {
      throw new EventResponse(false, 'Invalid Username!', {});
    }

    // Generate OTP
    const otp = genrateOtp(6);

    // Send forgot password email
    await sendForgotPasswordEmail(user.email, user.username, otp);

    // Create OTP hash
    const salt = await bcrypt.genSalt(10);
    const otphash = await bcrypt.hash(otp.toString(), salt);

    // Generate token for forgot password email
    const payload = {
      id: user.id,
      username: user.username,
    };

    const tempToken = jwt.sign(payload, process.env.TEMP_SECRET, {
      expiresIn: '10m',
    });

    // Update OTP hash in database
    const updateStmt = configDB.prepare('UPDATE users SET forgotOtpHash = ? WHERE username = ?');

    updateStmt.run(otphash, username);

    // Create response and emit event
    const response = new EventResponse(true, 'Otp Sent To Your Email.', tempToken);
    event.reply('forgotpasswordemail', response);
  } catch (err) {
    event.reply('forgotpasswordemail', err);
  }
});

// validate otp Event
ipcMain.on('validateotp', async (event, args) => {
  try {
    const { otp, token } = await args;
    const decodedToken: any = jwt.verify(token, process.env.TEMP_SECRET);

    const stmt = configDB.prepare('SELECT * FROM users WHERE username = ?');
    const user: any = stmt.get(decodedToken.username);

    if (!user) {
      throw new EventResponse(false, 'Something Went Wrong!', {});
    }

    const isOtpCorrect = await bcrypt.compare(otp, user.forgotOtpHash);
    if (!isOtpCorrect) {
      throw new EventResponse(false, 'Incorrect OTP!', {});
    }

    const updateStmt = configDB.prepare('UPDATE users SET otpValidation = ? WHERE username = ?');
    updateStmt.run('success', decodedToken.username);

    event.reply('validateotp', new EventResponse(true, 'Success', {}));
  } catch (err) {
    event.reply('validateotp', err);
  }
});

// forgot password Event
ipcMain.on('forgotpassword', async (event, args) => {
  try {
    const { newpassword, token } = await args;
    if (!token) {
      throw new EventResponse(false, 'Unauthorized Access!', {});
    }

    const decodedToken: any = jwt.verify(token, process.env.TEMP_SECRET);
    const stmt = configDB.prepare('SELECT * FROM users WHERE username = ?');
    const user: any = stmt.get(decodedToken.username);

    if (!user || user.otpValidation !== 'success') {
      throw new EventResponse(false, 'Unauthorized Access!', {});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(newpassword, salt);

    const updateStmt = configDB.prepare('UPDATE users SET password = ? WHERE username = ?');
    updateStmt.run(hashPass, decodedToken.username);

    const resetStmt = configDB.prepare(
      'UPDATE users SET forgotOtpHash = NULL, otpValidation = NULL WHERE username = ?'
    );
    resetStmt.run(decodedToken.username);

    event.reply('forgotpassword', new EventResponse(true, 'Successfully Changed Password.', {}));
  } catch (err) {
    event.reply('forgotpassword', err);
  }
});

// -----------------------------
//     Invoice Events
// ----------------------------

// Create inovice Event
ipcMain.on('createinvoice', (event, args) => {
  try {
    const { invoiceData } = args;

    const {
      name,
      phone,
      address,
      exchange,
      exchangeCategory,
      exchangeWeight,
      exchangePercentage,
      exchangeAmount,
      gst,
      gstPercentage,
      gstAmount,
      discount,
      grossAmount,
      totalAmount,
      products,
      payments,
    } = invoiceData;

    // Generate invoice ID like INV001, INV002, etc.
    const row:any = dataDB.prepare('SELECT invoiceNo FROM invoices ORDER BY createdAt DESC LIMIT 1').get();
    let invoiceId: string;
    if (row?.invoiceNo) {
      const number = parseInt(row.invoiceNo.replace('INV', ''), 10);
      invoiceId = 'INV' + String(number + 1).padStart(3, '0');
    } else {
      invoiceId = 'INV001';
    }

    const paymentStatus = payments.dueAmount === 0 ? 'Full Paid' : 'Due Amount';

    // Insert invoice
    const invoiceStmt = dataDB.prepare(`
      INSERT INTO invoices (
        invoiceNo, name, phone, address, exchange, exchangeCategory,
        exchangeWeight, exchangePercentage, exchangeAmount,
        gst, gstPercentage, gstAmount, discount, grossAmount,
        totalAmount, dueAmount, paymentStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    invoiceStmt.run(
      invoiceId,
      name,
      phone,
      address,
      exchange,
      exchangeCategory,
      exchangeWeight,
      exchangePercentage,
      exchangeAmount,
      gst,
      gstPercentage,
      gstAmount,
      discount,
      grossAmount,
      totalAmount,
      payments.dueAmount,
      paymentStatus
    );

    // Insert products
    const productStmt = dataDB.prepare(`
      INSERT INTO products (
        invoiceId, name, category, weight,
        quantity, rate, amount, makingCost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const prod of products) {
      productStmt.run(
        invoiceId,
        prod.name,
        prod.category,
        prod.weight,
        prod.quantity,
        prod.rate,
        prod.amount,
        prod.makingCost
      );
    }

    // Insert payment
    const paymentStmt = dataDB.prepare(`
      INSERT INTO payments (
        invoiceId, paidAmount
      ) VALUES (?, ?)
    `);

    paymentStmt.run(invoiceId, payments.paidAmount);

    const response = new EventResponse(true, 'Invoice Saved Successfully.', {
      invoiceId,
    });
    event.reply('createinvoice', response);
  } catch (err: any) {
    const response = new EventResponse(false, 'Failed to save invoice.', {
      error: err.message,
    });
    event.reply('createinvoice', response);
  }
});

// fetch invoice by InvoiceNo Event
ipcMain.on('fetchbyinvoiceno', async (event, args) => {
  try {
    const { invoiceNo } = await args;

    const stmt = dataDB.prepare(`
      SELECT 
      i.*,
      p.id AS productId,
      p.name AS productName,
      p.category AS productCategory,
      p.weight AS productWeight,
      p.quantity AS productQuantity,
      p.rate AS productRate,
      p.amount AS productAmount,
      p.makingCost AS productMakingCost,
      pay.id AS paymentId,
      pay.paidAmount,
      pay.createdAt AS paymentCreatedAt
      FROM invoices i
      LEFT JOIN products p ON i.invoiceNo = p.invoiceId
      LEFT JOIN payments pay ON i.invoiceNo = pay.invoiceId
      WHERE i.invoiceNo = ?
    `);

    const invoice: any = stmt.all(invoiceNo);

    if (!invoice || invoice.length === 0) {
      throw new EventResponse(false, 'Invalid Invoice Number!', {});
    }

    // Extract invoice-level data from the first row
    const data = [
      {
        invoiceNo: invoice[0]?.invoiceNo,
        name: invoice[0]?.name,
        phone: invoice[0]?.phone,
        address: invoice[0]?.address,
        exchange: invoice[0]?.exchange,
        exchangeCategory: invoice[0]?.exchangeCategory,
        exchangeWeight: invoice[0]?.exchangeWeight,
        exchangePercentage: invoice[0]?.exchangePercentage,
        exchangeAmount: invoice[0]?.exchangeAmount,
        gst: invoice[0]?.gst,
        gstPercentage: invoice[0]?.gstPercentage,
        gstAmount: invoice[0]?.gstAmount,
        discount: invoice[0]?.discount,
        grossAmount: invoice[0]?.grossAmount,
        totalAmount: invoice[0]?.totalAmount,
        dueAmount: invoice[0]?.dueAmount,
        paymentStatus: invoice[0]?.paymentStatus,
        createdAt: invoice[0]?.createdAt,
        products: [],
        payments: [],
      },
    ];

    const seenProducts = new Set();
    const seenPayments = new Set();

    for (const row of invoice) {
      // Avoid duplicate product rows
      if (row.productId && !seenProducts.has(row.productId)) {
        seenProducts.add(row.productId);
        data[0].products.push({
          id: row.productId,
          name: row.productName,
          category: row.productCategory,
          weight: row.productWeight,
          quantity: row.productQuantity,
          rate: row.productRate,
          amount: row.productAmount,
          makingCost: row.productMakingCost,
        });
      }

      if (row.paymentId && !seenPayments.has(row.paymentId)) {
        seenPayments.add(row.paymentId);
        data[0].payments.push({
          id: row.paymentId,
          paidAmount: row.paidAmount,
          createdAt: row.paymentCreatedAt,
        });
      }
    }

    const finalData = {
      totalPages: 1,
      currentPage: 1,
      invoices: data,
    };

    // create response and emmit event
    const response = new EventResponse(true, 'Success', finalData);
    event.sender.send('fetchbyinvoiceno', response);
  } catch (err) {
    event.sender.send('fetchbyinvoiceno', err);
  }
});

// fetch invoice by Customer name Event
ipcMain.on('fetchbycustomername', async (event, args) => {
  try {
    const { name, pageNo } = await args;

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const skip = (page - 1) * limit; // Calculate skip value

    // Check if customer exists
    const checkCustomer: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS total FROM invoices
      WHERE name LIKE ?
    `
      )
      .get(`%${name}%`).total;

    console.log('Check customer: ' + checkCustomer);

    if (checkCustomer === 0) {
      throw new EventResponse(false, 'Invalid Customer Name!', {});
    }

    // Main JOIN query to get invoices, products, and payments
    const rows: any = dataDB
      .prepare(
        `
      SELECT 
        i.*,
        p.id AS productId,
        p.name AS productName,
        p.category AS productCategory,
        p.weight AS productWeight,
        p.quantity AS productQuantity,
        p.rate AS productRate,
        p.amount AS productAmount,
        p.makingCost AS productMakingCost,
        pay.id AS paymentId,
        pay.paidAmount,
        pay.createdAt AS paymentCreatedAt
      FROM invoices i
      LEFT JOIN products p ON i.invoiceNo = p.invoiceId
      LEFT JOIN payments pay ON i.invoiceNo = pay.invoiceId
      WHERE i.name LIKE ?
      ORDER BY i.createdAt ASC
      LIMIT ? OFFSET ?
    `
      )
      .all(`%${name}%`, limit, skip);

    console.log('rows  :  ' + rows);

    // Grouping by invoiceNo
    const invoiceMap = new Map();

    for (const row of rows) {
      if (!invoiceMap.has(row.invoiceNo)) {
        invoiceMap.set(row.invoiceNo, {
          invoiceNo: row.invoiceNo,
          name: row.name,
          phone: row.phone,
          address: row.address,
          exchange: row.exchange,
          exchangeCategory: row.exchangeCategory,
          exchangeWeight: row.exchangeWeight,
          exchangePercentage: row.exchangePercentage,
          exchangeAmount: row.exchangeAmount,
          gst: row.gst,
          gstPercentage: row.gstPercentage,
          gstAmount: row.gstAmount,
          discount: row.discount,
          grossAmount: row.grossAmount,
          totalAmount: row.totalAmount,
          dueAmount: row.dueAmount,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          products: [],
          payments: [],
        });
      }

      const invoice = invoiceMap.get(row.invoiceNo);

      // Add product
      if (row.productId && !invoice.products.find((p) => p.id === row.productId)) {
        invoice.products.push({
          id: row.productId,
          name: row.productName,
          category: row.productCategory,
          weight: row.productWeight,
          quantity: row.productQuantity,
          rate: row.productRate,
          amount: row.productAmount,
          makingCost: row.productMakingCost,
        });
      }

      // Add payment
      if (row.paymentId && !invoice.payments.find((p) => p.id === row.paymentId)) {
        invoice.payments.push({
          id: row.paymentId,
          paidAmount: row.paidAmount,
          createdAt: row.paymentCreatedAt,
        });
      }
    }

    // Sort payments by createdAt (ascending) for each invoice
    invoiceMap.forEach((invoice) => {
      invoice.payments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    if (!rows || rows.length === 0) {
      throw new EventResponse(false, 'Invalid Customer Name!', {});
    }

    // Get total invoice count for pagination
    const totalCount = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS total FROM invoices
      WHERE name LIKE ?
    `
      )
      .get(`%${name}%`).total;

    console.log('invoices : ' + Array.from(invoiceMap.values()));

    const data = {
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      invoices: Array.from(invoiceMap.values()),
    };

    // create response and emmit event
    const response = new EventResponse(true, 'Success', data);
    event.reply('fetchbycustomername', response);
  } catch (err) {
    event.reply('fetchbycustomername', err);
  }
});

// fetch invoice by date Range Event
ipcMain.on('fetchbydaterange', async (event, args) => {
  try {
    const { startingDate, endingDate, pageNo } = await args;

    const page = parseInt(pageNo) || 1;
    const limit = 40;
    const skip = (page - 1) * limit;

    const adjustedStartDate = new Date(startingDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() - 1);

    const adjustedEndDate = new Date(endingDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const startISO = adjustedStartDate.toISOString();
    const endISO = adjustedEndDate.toISOString();

    const rows: any = dataDB
      .prepare(
        `
      SELECT 
        i.*,
        p.id AS productId,
        p.name AS productName,
        p.category AS productCategory,
        p.weight AS productWeight,
        p.quantity AS productQuantity,
        p.rate AS productRate,
        p.amount AS productAmount,
        p.makingCost AS productMakingCost,
        pay.id AS paymentId,
        pay.paidAmount,
        pay.createdAt AS paymentCreatedAt
      FROM invoices i
      LEFT JOIN products p ON i.invoiceNo = p.invoiceId
      LEFT JOIN payments pay ON i.invoiceNo = pay.invoiceId
      WHERE i.createdAt > ? AND i.createdAt < ?
      ORDER BY i.createdAt ASC
      LIMIT ? OFFSET ?
    `
      )
      .all(startISO, endISO, limit, skip);

    const invoiceMap = new Map();

    for (const row of rows) {
      if (!invoiceMap.has(row.invoiceNo)) {
        invoiceMap.set(row.invoiceNo, {
          invoiceNo: row.invoiceNo,
          name: row.name,
          phone: row.phone,
          address: row.address,
          exchange: row.exchange,
          exchangeCategory: row.exchangeCategory,
          exchangeWeight: row.exchangeWeight,
          exchangePercentage: row.exchangePercentage,
          exchangeAmount: row.exchangeAmount,
          gst: row.gst,
          gstPercentage: row.gstPercentage,
          gstAmount: row.gstAmount,
          discount: row.discount,
          grossAmount: row.grossAmount,
          totalAmount: row.totalAmount,
          dueAmount: row.dueAmount,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          products: [],
          payments: [],
        });
      }

      const invoice = invoiceMap.get(row.invoiceNo);

      if (row.productId && !invoice.products.find((p) => p.id === row.productId)) {
        invoice.products.push({
          id: row.productId,
          name: row.productName,
          category: row.productCategory,
          weight: row.productWeight,
          quantity: row.productQuantity,
          rate: row.productRate,
          amount: row.productAmount,
          makingCost: row.productMakingCost,
        });
      }

      if (row.paymentId && !invoice.payments.find((p) => p.id === row.paymentId)) {
        invoice.payments.push({
          id: row.paymentId,
          paidAmount: row.paidAmount,
          createdAt: row.paymentCreatedAt,
        });
      }
    }

    // // Compute paidAmount and dueAmount for each invoice
    // invoiceMap.forEach((invoice) => {
    //   invoice.payments.sort(
    //     (a, b) =>
    //       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    //   );
    //   const totalPaid = invoice.payments.reduce(
    //     (sum, p) => sum + (p.paidAmount || 0),
    //     0
    //   );
    //   invoice.paidAmount = totalPaid;
    //   invoice.dueAmount = invoice.totalAmount - totalPaid;
    // });

    const totalCount = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS total FROM invoices
      WHERE createdAt > ? AND createdAt < ?
    `
      )
      .get(startISO, endISO).total;

    const data = {
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      invoices: Array.from(invoiceMap.values()),
    };

    event.reply('fetchbydaterange', new EventResponse(true, 'Success', data));
  } catch (err) {
    event.reply('fetchbydaterange', err);
  }
});

// fetch Monthly invoice Event
ipcMain.on('fetchmonthlyinvoice', async (event) => {
  try {
    // Get current month range (1st to 1st of next month)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const rows: any = dataDB
      .prepare(
        `
      SELECT 
        i.*,
        p.id AS productId,
        p.name AS productName,
        p.category AS productCategory,
        p.weight AS productWeight,
        p.quantity AS productQuantity,
        p.rate AS productRate,
        p.amount AS productAmount,
        p.makingCost AS productMakingCost,
        pay.id AS paymentId,
        pay.paidAmount,
        pay.createdAt AS paymentCreatedAt
      FROM invoices i
      LEFT JOIN products p ON i.invoiceNo = p.invoiceId
      LEFT JOIN payments pay ON i.invoiceNo = pay.invoiceId
      WHERE i.createdAt >= ? AND i.createdAt < ?
      ORDER BY i.createdAt ASC
    `
      )
      .all(startDate.toISOString(), endDate.toISOString());

    // Group by invoice
    const invoiceMap = new Map();

    for (const row of rows) {
      if (!invoiceMap.has(row.invoiceNo)) {
        invoiceMap.set(row.invoiceNo, {
          invoiceNo: row.invoiceNo,
          name: row.name,
          phone: row.phone,
          address: row.address,
          exchange: row.exchange,
          exchangeCategory: row.exchangeCategory,
          exchangeWeight: row.exchangeWeight,
          exchangePercentage: row.exchangePercentage,
          exchangeAmount: row.exchangeAmount,
          gst: row.gst,
          gstPercentage: row.gstPercentage,
          gstAmount: row.gstAmount,
          discount: row.discount,
          grossAmount: row.grossAmount,
          totalAmount: row.totalAmount,
          dueAmount: row.dueAmount,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          products: [],
          payments: [],
        });
      }

      const invoice = invoiceMap.get(row.invoiceNo);

      if (row.productId && !invoice.products.find((p) => p.id === row.productId)) {
        invoice.products.push({
          id: row.productId,
          name: row.productName,
          category: row.productCategory,
          weight: row.productWeight,
          quantity: row.productQuantity,
          rate: row.productRate,
          amount: row.productAmount,
          makingCost: row.productMakingCost,
        });
      }

      if (row.paymentId && !invoice.payments.find((p) => p.id === row.paymentId)) {
        invoice.payments.push({
          id: row.paymentId,
          paidAmount: row.paidAmount,
          createdAt: row.paymentCreatedAt,
        });
      }
    }

    // Sort payments by createdAt (ascending) for each invoice
    invoiceMap.forEach((invoice) => {
      invoice.payments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    //Compute paidAmount and dueAmount
    // invoiceMap.forEach((invoice) => {
    //   invoice.payments.sort(
    //     (a, b) =>
    //       new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    //   );
    //   const totalPaid = invoice.payments.reduce(
    //     (sum, p) => sum + (p.paidAmount || 0),
    //     0
    //   );
    //   invoice.paidAmount = totalPaid;
    //   invoice.dueAmount = invoice.totalAmount - totalPaid;
    // });

    event.reply(
      'fetchmonthlyinvoice',
      new EventResponse(true, 'success.', Array.from(invoiceMap.values()))
    );
  } catch (err) {
    event.reply('fetchmonthlyinvoice', err);
  }
});

// total count of invoice Event
ipcMain.on('totalcountofinvoice', async (event) => {
  try {
    const result: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS total FROM invoices;
    `
      )
      .get();

    // create response and emmit event
    const response = new EventResponse(true, 'Success', result.total);
    event.reply('totalcountofinvoice', response);
  } catch (err) {
    event.reply('totalcountofinvoice', err);
  }
});

// Get all Invoices Event
ipcMain.on('getallinvoice', async (event, args) => {
  try {
    const { pageNo } = await args;

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const skip = (page - 1) * limit; // Calculate skip value

    // Fetch paginated invoices with joins
    const rows: any = dataDB
      .prepare(
        `
      SELECT 
        i.*,
        p.id AS productId,
        p.name AS productName,
        p.category AS productCategory,
        p.weight AS productWeight,
        p.quantity AS productQuantity,
        p.rate AS productRate,
        p.amount AS productAmount,
        p.makingCost AS productMakingCost,
        pay.id AS paymentId,
        pay.paidAmount,
        pay.createdAt AS paymentCreatedAt
        FROM invoices i
        LEFT JOIN products p ON i.invoiceNo = p.invoiceId
        LEFT JOIN payments pay ON i.invoiceNo = pay.invoiceId
        ORDER BY i.createdAt ASC
        LIMIT ? OFFSET ?
    `
      )
      .all(limit, skip);

    // Count total invoices for pagination
    const total = dataDB.prepare(`SELECT COUNT(*) AS count FROM invoices`).get().count;

    // Group by invoice
    const invoiceMap = new Map();

    for (const row of rows) {
      if (!invoiceMap.has(row.invoiceNo)) {
        invoiceMap.set(row.invoiceNo, {
          invoiceNo: row.invoiceNo,
          name: row.name,
          phone: row.phone,
          address: row.address,
          exchange: row.exchange,
          exchangeCategory: row.exchangeCategory,
          exchangeWeight: row.exchangeWeight,
          exchangePercentage: row.exchangePercentage,
          exchangeAmount: row.exchangeAmount,
          gst: row.gst,
          gstPercentage: row.gstPercentage,
          gstAmount: row.gstAmount,
          discount: row.discount,
          grossAmount: row.grossAmount,
          totalAmount: row.totalAmount,
          dueAmount: row.dueAmount,
          paymentStatus: row.paymentStatus,
          createdAt: row.createdAt,
          products: [],
          payments: [],
        });
      }

      const invoice = invoiceMap.get(row.invoiceNo);

      if (row.productId && !invoice.products.find((p) => p.id === row.productId)) {
        invoice.products.push({
          id: row.productId,
          name: row.productName,
          category: row.productCategory,
          weight: row.productWeight,
          quantity: row.productQuantity,
          rate: row.productRate,
          amount: row.productAmount,
          makingCost: row.productMakingCost,
        });
      }

      if (row.paymentId && !invoice.payments.find((p) => p.id === row.paymentId)) {
        invoice.payments.push({
          id: row.paymentId,
          paidAmount: row.paidAmount,
          createdAt: row.paymentCreatedAt,
        });
      }
    }

    // Sort payments by createdAt (ascending) for each invoice
    invoiceMap.forEach((invoice) => {
      invoice.payments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    const data = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      invoices: Array.from(invoiceMap.values()),
    };

    // create response and emmit event
    const response = new EventResponse(true, 'Success', data);
    event.reply('getallinvoice', response);
  } catch (err) {
    event.reply('getallinvoice', err);
  }
});

//tracks Event
ipcMain.on('tracks', async (event) => {
  try {
    // Fetch total invoices, total paid invoices, and total due invoices (where due amount > 0)
    const totalInvoicesStmt = dataDB.prepare(`
      SELECT COUNT(*) AS totalInvoices FROM invoices
    `);
    const totalInvoicesResult: any = totalInvoicesStmt.get();

    const totalPaidInvoicesStmt = dataDB.prepare(`
      SELECT COUNT(*) AS totalPaidInvoices FROM invoices i
      WHERE i.paymentStatus = ?
    `);
    const totalPaidInvoicesResult: any = totalPaidInvoicesStmt.get('Full Paid');

    const totalDueInvoicesStmt = dataDB.prepare(`
      SELECT COUNT(*) AS totalDueInvoices FROM invoices i
      WHERE i.paymentStatus = ?
    `);
    const totalDueInvoicesResult: any = totalDueInvoicesStmt.get('Due Amount');

    // Calculate total outstanding amount
    const outstandingAmountStmt = dataDB.prepare(`
      SELECT SUM(i.totalAmount - COALESCE(p.paidAmount, 0)) AS outstandingAmount 
      FROM invoices i
      LEFT JOIN payments p ON i.invoiceNo = p.invoiceId
      WHERE (i.totalAmount - COALESCE(p.paidAmount, 0)) > 0
    `);
    const outstandingAmountResult: any = outstandingAmountStmt.get();

    // Preparing the summary data
    const tracksData = [
      {
        title: 'Outstanding',
        value: `₹ ${outstandingAmountResult.outstandingAmount || 0} `,
        icon: 'FaDollarSign',
      },
      {
        title: 'Total Invoices',
        value: `${totalInvoicesResult.totalInvoices || 0}`,
        icon: 'FiFileText',
      },
      {
        title: 'Paid Inovices',
        value: `${totalPaidInvoicesResult.totalPaidInvoices || 0}`,
        icon: 'MdPaid',
      },
      {
        title: 'Due Invoices',
        value: `${totalDueInvoicesResult.totalDueInvoices || 0}`,
        icon: 'IoMdWarning',
      },
    ];

    // create response and emmit event
    const response = new EventResponse(true, 'Success', tracksData);
    event.sender.send('tracks', response);
  } catch (err) {
    event.sender.send('tracks', err);
  }
});

// Get Due Invoices Event
ipcMain.on('getdueinvoices', async (event, args) => {
  try {
    const { pageNo } = await args;

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const offset = (page - 1) * limit; // Calculate skip value

    // Step 1: Get all payments with dueAmount > 0 using subquery join
    const stmt = dataDB.prepare(`
        SELECT
          i.invoiceNo,
		      i.name,
		      i.address,
		      i.phone,
		      i.totalAmount,
          i.discount,
          i.dueAmount,
          i.createdAt,
          pay.id AS paymentId,
          pay.paidAmount
        FROM invoices i
        LEFT JOIN payments pay ON pay.invoiceId = i.invoiceNo
        WHERE i.paymentStatus = ?
        ORDER BY i.createdAt ASC
        LIMIT ? OFFSET ?;
      `);

    const rows: any = stmt.all('Due Amount', limit, offset);

    // Step 2: Get total count of due invoices (grouped by invoiceNo)
    const total = dataDB
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM invoices i
        WHERE i.paymentStatus = ?
      `
      )
      .get('Due Amount').count;

    // Step 3: Group rows by invoice
    const invoiceMap = new Map();

    for (const row of rows) {
      if (!invoiceMap.has(row.invoiceNo)) {
        invoiceMap.set(row.invoiceNo, {
          invoiceNo: row.invoiceNo,
          name: row.name,
          phone: row.phone,
          address: row.address,
          totalAmount: row.totalAmount,
          createdAt: row.createdAt,
          discount: row.discount,
          paidAmount: row.paidAmount,
          dueAmount: row.dueAmount,
        });
      }
    }
    const data = {
      totalPages: Math.ceil(total / limit),
      currentPage: pageNo,
      invoices: Array.from(invoiceMap.values()),
    };

    event.reply('getdueinvoices', new EventResponse(true, 'Success', data));
  } catch (err) {
    console.error(err);
    event.reply('getdueinvoices', new EventResponse(false, 'Error', err));
  }
});

// -----------------------------
//     Setting Events
// ----------------------------

// create invoice Event
ipcMain.on('createsetting', async (event, args) => {
  try {
    const { ownerName, mobileNo, whatsappNo, address, shopName, GSTNO } = await args;

    // check if a setting allready exists
    const checkSettingStmt = configDB.prepare('SELECT * FROM settings LIMIT 1');
    const existingSetting = checkSettingStmt.get();

    if (existingSetting) {
      // Update existing settings
      const updateStmt = configDB.prepare(`
        UPDATE settings SET 
          ownerName = ?, 
          mobileNo = ?, 
          whatsappNo = ?, 
          address = ?, 
          shopName = ?, 
          GSTNO = ?
      `);

      updateStmt.run(ownerName, mobileNo, whatsappNo, address, shopName, GSTNO);

      event.reply('createsetting', new EventResponse(true, 'Updated Successfully', {}));
      return;
    }

    // Insert new setting if none exists
    const insertStmt = configDB.prepare(`
      INSERT INTO settings (ownerName, mobileNo, whatsappNo, address, shopName, GSTNO, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      ownerName,
      mobileNo,
      whatsappNo,
      address,
      shopName,
      GSTNO,
      new Date().toISOString()
    );

    event.reply('createsetting', new EventResponse(true, 'Updated Successfully', {}));
  } catch (err) {
    event.reply('createsetting', err);
  }
});

// fetch setting Event
ipcMain.on('fetchsetting', async (event) => {
  try {
    // Fetch the first (and only) settings record
    const getSettingStmt = configDB.prepare('SELECT * FROM settings LIMIT 1');
    const setting = getSettingStmt.get();

    let newSetting = setting || {
      ownerName: 'Not Available',
      mobileNo: 'Not Available',
      whatsappNo: 'Not Available',
      address: 'Not Available',
      shopName: 'Not Available',
      GSTNO: 'Not Available',
    };

    // Create response and emit event
    const response = new EventResponse(true, 'Success', newSetting);
    event.reply('fetchsetting', response);
  } catch (err) {
    event.reply('fetchsetting', err);
  }
});

// upload qr code for payment Event
ipcMain.on('uploadqr', async (event, args) => {
  try {
    const { fileName, qrimg } = args;

    const base64Data = qrimg.replace(/^data:image\/\w+;base64,/, '');
    const filePath = path.join(uploadPath, fileName);

    // Fetch current settings
    const setting: any = configDB.prepare('SELECT qrPath FROM settings LIMIT 1').get();
    const oldfilePath = setting?.qrPath;

    // Function to update the QR path in the database
    const updateQRPath = (newFilePath: string) => {
      const updateStmt = configDB.prepare('UPDATE settings SET qrPath = ?');

      if (!setting) {
        // Insert new row if settings do not exist
        configDB.prepare('INSERT INTO settings (qrPath) VALUES (?)').run(newFilePath);
      } else {
        updateStmt.run(newFilePath);
      }
    };

    // Write new QR code image
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Remove old file if it exists
    if (oldfilePath && fs.existsSync(oldfilePath)) {
      fs.unlinkSync(oldfilePath);
    }

    // Update the database with new QR image path
    updateQRPath(filePath);

    // Create response and emit event
    const response = new EventResponse(true, 'Successfully updated QR code.', filePath);
    event.reply('uploadqr', response);
  } catch (err) {
    event.reply('uploadqr', err);
  }
});

// get Qr code Event
ipcMain.on('getqr', async (event) => {
  try {
    // Fetch QR image path from the settings table
    const setting: any = configDB.prepare('SELECT qrPath FROM settings LIMIT 1').get();
    const filePath = setting?.qrPath;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new EventResponse(false, 'Failed!', {});
    }

    // Read the image and convert it to base64
    const imageBuffer = fs.readFileSync(filePath);
    const imageSrc = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Send the image as response
    const response = new EventResponse(true, 'Success', imageSrc);
    event.reply('getqr', response);
  } catch (err) {
    event.reply('getqr', err);
  }
});

// upload Invoice logo Event
ipcMain.on('upload-logo', async (event, args) => {
  try {
    const { fileName, logo } = await args;

    const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
    const filePath = path.join(uploadPath, fileName);

    // Fetch current logo path
    const setting: any = configDB.prepare('SELECT logoPath FROM settings LIMIT 1').get();
    const oldfilePath = setting?.logoPath;

    // Function to update the QR path in the database
    const updateLogoPath = (newFilePath: string) => {
      const updateStmt = configDB.prepare('UPDATE settings SET logoPath = ?');

      if (!setting) {
        // Insert new row if settings do not exist
        configDB.prepare('INSERT INTO settings (logoPath) VALUES (?)').run(newFilePath);
      } else {
        updateStmt.run(newFilePath);
      }
    };

    // Write new QR code image
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Remove old file if it exists
    if (oldfilePath && fs.existsSync(oldfilePath)) {
      fs.unlinkSync(oldfilePath);
    }

    // Update the database with new QR image path
    updateLogoPath(filePath);

    // Create response and emit event
    const response = new EventResponse(true, 'Successfully updated QR code.', filePath);
    event.reply('upload-log', response);
  } catch (err) {
    event.reply('upload-logo', err);
  }
});

// Get Logo Event
ipcMain.on('get-logo', async (event) => {
  try {
    // Fetch QR image path from the settings table
    const setting: any = configDB.prepare('SELECT logoPath FROM settings LIMIT 1').get();
    const filePath = setting?.logoPath;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new EventResponse(false, 'Failed!', {});
    }
    // Read the image and convert it to base64
    const imageBuffer = fs.readFileSync(filePath);
    const logoSrc = `data:/image/png;base64, ${imageBuffer.toString('base64')}`;

    // Send the image as response
    const response = new EventResponse(true, 'Success', logoSrc);
    event.reply('get-logo', response);
  } catch (err) {
    event.reply('get-logo', err);
  }
});

// Exprt to excel Event
// ipcMain.on("export2excel", async (event, args) => {
//   try {
//     const { date } = args;

//     // Convert dates and subtract one day from startingDate
//     const adjustedStartDate = new Date(date.start);
//     adjustedStartDate.setDate(adjustedStartDate.getDate() - 1); // Subtract 1 day

//     const adjustedEndDate = new Date(date.end);
//     adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

//     // Fetch invoice data from SQLite with JOINs
//     const invoices: any = dataDB
//       .prepare(
//         `
//       SELECT
//         i.invoiceNo,
//         i.customerName,
//         i.customerPhone,
//         i.customerAddress,
//         i.exchangeCategory,
//         i.exchangeWeight,
//         i.exchangePercentage,
//         i.exchangeAmount,
//         i.GSTPercentage,
//         i.discount,
//         i.totalAmount,
//         p.id AS productId,
//         p.name AS productName,
//         p.category AS productCategory,
//         p.weight AS productWeight,
//         p.quantity AS productQuantity,
//         p.rate AS productRate,
//         p.amount AS productAmount,
//         p.makingCost AS productMakingCost
//       FROM invoices i
//       LEFT JOIN products p ON i.invoiceNo = p.invoiceId
//       WHERE i.createdAt BETWEEN ? AND ?
//     `
//       )
//       .all(adjustedStartDate.toISOString(), adjustedEndDate.toISOString());

//     if (invoices.length === 0) {
//       throw new EventResponse(false, "Don't have Any Invoice!", {});
//     }

//     let headerData = [
//       [
//         "InvoiceNO",
//         "Name",
//         "PhoneNo",
//         "Address",
//         "exchangeCategory",
//         "exchangeWeight",
//         "exchangePercentage",
//         "exchangeAmount",
//         "ProName",
//         "ProCategory",
//         "ProRate",
//         "ProWeight",
//         "ProQuantity",
//         "ProMaking",
//         "ProAmount",
//         "Gst(%)",
//         "Discount",
//         "Total",
//       ],
//     ];

//     let merges = [];
//     let rowIndex = 1; // Start after the header

//     // Organize the data for export
//     invoices.forEach((invoice) => {
//       let startRow = rowIndex;

//       headerData.push([
//         invoice.invoiceNo,
//         invoice.name,
//         invoice.phone,
//         invoice.address,
//         invoice.exchangeCategory,
//         invoice.exchangeWeight,
//         invoice.exchangePercentage,
//         invoice.exchangeAmount,
//         invoice.productName,
//         invoice.productCategory,
//         invoice.productRate.toString(),
//         invoice.productWeight.toString(),
//         invoice.productQuantity.toString(),
//         invoice.productMakingCost.toString(),
//         invoice.productAmount.toString(),
//         invoice.GSTPercentage.toString(),
//         invoice.discount.toString(),
//         invoice.totalAmount.toString(),
//       ]);
//       rowIndex++;

//       // Merge columns for better visual in Excel
//       merges.push({ s: { r: startRow, c: 0 }, e: { r: rowIndex - 1, c: 0 } }); // Merge invoiceNO column
//       merges.push({ s: { r: startRow, c: 1 }, e: { r: rowIndex - 1, c: 1 } }); // Merge name column
//       merges.push({ s: { r: startRow, c: 2 }, e: { r: rowIndex - 1, c: 2 } }); // Merge phoneNo column
//       merges.push({ s: { r: startRow, c: 3 }, e: { r: rowIndex - 1, c: 3 } }); // Merge address column
//       merges.push({ s: { r: startRow, c: 4 }, e: { r: rowIndex - 1, c: 4 } }); // Merge exchangeCategory column
//       merges.push({ s: { r: startRow, c: 5 }, e: { r: rowIndex - 1, c: 5 } }); // Merge exchangeWeight column
//       merges.push({ s: { r: startRow, c: 6 }, e: { r: rowIndex - 1, c: 6 } }); // Merge exchangePercentage column
//       merges.push({ s: { r: startRow, c: 7 }, e: { r: rowIndex - 1, c: 7 } }); // Merge exchangeAmount column
//       merges.push({ s: { r: startRow, c: 15 }, e: { r: rowIndex - 1, c: 15 } }); // Merge gst column
//       merges.push({ s: { r: startRow, c: 16 }, e: { r: rowIndex - 1, c: 16 } }); // Merge discount column
//       merges.push({ s: { r: startRow, c: 17 }, e: { r: rowIndex - 1, c: 17 } }); // Merge total column
//     });

//     // Step 4: Get Desktop Path
//     const desktopPath = path.join(
//       app.getPath("documents"),
//       `exported_invoice_(${moment(date.start).format("DD-MMM-YYYY")}-${moment(
//         date.end
//       ).format("DD-MMM-YYYY")}).xlsx`
//     );

//     // Convert data to worksheet
//     const ws = XLSX.utils.aoa_to_sheet(headerData);
//     ws["!merges"] = merges; // Apply merging
//     ws["!cols"] = [
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 20 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 20 },
//       { wch: 10 },
//       { wch: 10 },
//       { wch: 20 },
//     ];

//     // Create workbook
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Invoices");

//     // Step 5: Write the Excel file to Desktop
//     XLSX.writeFile(wb, desktopPath);

//     const response = new EventResponse(true, "Successfully Saved!", {});
//     event.reply("export2excel", response);
//   } catch (err) {
//     event.reply("export2excel", err);
//   }
// });

ipcMain.on('export2excel', async (event, args) => {
  try {
    const { date } = args;

    const adjustedStartDate = new Date(date.start);
    adjustedStartDate.setDate(adjustedStartDate.getDate() - 1);

    const adjustedEndDate = new Date(date.end);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // Fetch invoice and product data
    const invoices: any = dataDB
      .prepare(
        `
      SELECT
        i.invoiceNo,
        i.name,
        i.phone,
        i.address,
        i.exchangeCategory,
        i.exchangeWeight,
        i.exchangePercentage,
        i.exchangeAmount,
        i.gstPercentage,
        i.discount,
        i.totalAmount,
        p.id AS productId,
        p.name AS productName,
        p.category AS productCategory,
        p.weight AS productWeight,
        p.quantity AS productQuantity,
        p.rate AS productRate,
        p.amount AS productAmount,
        p.makingCost AS productMakingCost
      FROM invoices i
      LEFT JOIN products p ON i.invoiceNo = p.invoiceId
      WHERE i.createdAt BETWEEN ? AND ?
    `
      )
      .all(adjustedStartDate.toISOString(), adjustedEndDate.toISOString());

    if (!invoices.length) {
      return event.reply('export2excel', new EventResponse(false, 'No invoices found', {}));
    }

    const headerData = [
      [
        'InvoiceNO',
        'Name',
        'PhoneNo',
        'Address',
        'ExchangeCategory',
        'ExchangeWeight',
        'ExchangePercentage',
        'ExchangeAmount',
        'ProName',
        'ProCategory',
        'ProRate',
        'ProWeight',
        'ProQuantity',
        'ProMaking',
        'ProAmount',
        'GST(%)',
        'Discount',
        'Total',
      ],
    ];

    const merges = [];
    let rowIndex = 1;

    invoices.forEach((invoice) => {
      const startRow = rowIndex;

      headerData.push([
        invoice.invoiceNo,
        invoice.name,
        invoice.phone,
        invoice.address,
        invoice.exchangeCategory,
        invoice.exchangeWeight,
        invoice.exchangePercentage,
        invoice.exchangeAmount,
        invoice.productName,
        invoice.productCategory,
        invoice.productRate?.toString(),
        invoice.productWeight?.toString(),
        invoice.productQuantity?.toString(),
        invoice.productMakingCost?.toString(),
        invoice.productAmount?.toString(),
        invoice.gstPercentage?.toString(),
        invoice.discount?.toString(),
        invoice.totalAmount?.toString(),
      ]);
      rowIndex++;

      // Merge repeated invoice columns
      for (const col of [0, 1, 2, 3, 4, 5, 6, 7, 15, 16, 17]) {
        merges.push({
          s: { r: startRow, c: col },
          e: { r: rowIndex - 1, c: col },
        });
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(headerData);
    ws['!merges'] = merges;
    ws['!cols'] = Array(18).fill({ wch: 20 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

    // Show save dialog
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Exported Excel',
      defaultPath: path.join(app.getPath('documents'), `exported_data.xlsx`),
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    });

    if (canceled || !filePath) {
      return event.reply('export2excel', new EventResponse(false, 'Export cancelled', {}));
    }

    XLSX.writeFile(wb, filePath);
    event.reply('export2excel', new EventResponse(true, 'Successfully exported Excel file!', {}));
  } catch (err) {
    console.error('Export Error:', err);
    event.reply('export2excel', new EventResponse(false, 'Export failed', { error: err.message }));
  }
});

// Feedback Event
ipcMain.on('feedback', async (event, args) => {
  try {
    const { message } = await args;
    await sendFeedbackEmail(message);
    const response = new EventResponse(true, 'Successfully Send Feedback.', {});
    event.reply('feedback', response);
  } catch (err) {
    event.reply('feedback', err);
  }
});

//---------------------------------
//       Payment Events
//---------------------------------
ipcMain.on('payment', async (event, args) => {
  try {
    const { paidAmount, invoiceNo } = await args;

    // Validate input
    if (!invoiceNo || !paidAmount || paidAmount <= 0) {
      throw new EventResponse(false, 'Invalid invoice number or paid amount', {});
    }

    // Fetch the invoice to check if it's valid and get due amount
    const invoice: any = dataDB
      .prepare(
        `
      SELECT dueAmount FROM invoices WHERE invoiceNo = ?
    `
      )
      .get(invoiceNo);

    if (!invoice) {
      throw new EventResponse(false, 'Invoice not found', {});
    }

    const dueAmount: number = invoice.dueAmount;

    console.log('due Amount : ' + dueAmount);

    if (dueAmount <= 0) {
      throw new EventResponse(false, 'The invoice is already fully paid', {});
    }

    // Check if the paid amount exceeds the due amount
    if (paidAmount > dueAmount) {
      throw new EventResponse(false, 'Paid amount exceeds the due amount', {});
    }

    const newDueAmount: number = dueAmount - paidAmount;
    const newPaymentStatus: string = newDueAmount === 0 ? 'Full Paid' : 'Due Amount';

    // Insert the payment record into the payments table
    const now = new Date().toISOString();

    const stmt = dataDB.prepare(`
      INSERT INTO payments (invoiceId, paidAmount, createdAt)
      VALUES (?, ?, ?)
    `);

    stmt.run(invoiceNo, paidAmount, now);

    // Update Due Amount record and paymentStatus record in invoice table
    const updateStmt = dataDB.prepare(`
      UPDATE invoices 
      SET dueAmount = ?, paymentStatus = ?
      WHERE invoiceNo = ?
    `);

    updateStmt.run(newDueAmount, newPaymentStatus, invoiceNo);

    const response = new EventResponse(true, 'Payment Add Successfully', {});

    event.reply('payment', response);
  } catch (error) {
    event.reply('payment', error);
  }
});

//---------------------------------
//       Suggestion Events
//---------------------------------

//---------------------------------
//       Reports Events
//---------------------------------

ipcMain.on('getWeeklyRevenueChart', async (event, year: number) => {
  try {
    const result: any[] = [];

    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 11, 31));

    let current = yearStart;

    while (!isAfter(current, yearEnd)) {
      const dayStart = formatISO(current, { representation: 'date' }) + 'T00:00:00';
      const dayEnd = formatISO(current, { representation: 'date' }) + 'T23:59:59';

      // Total revenue (payments made) on this day
      const revenueRow: any = dataDB
        .prepare(
          `
        SELECT SUM(paidAmount) AS totalRevenue, COUNT(*) AS paymentCount
        FROM payments
        WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
      `
        )
        .get(dayStart, dayEnd);

      // Total invoices created on this day
      const invoiceRow: any = dataDB
        .prepare(
          `
        SELECT COUNT(*) AS invoiceCount
        FROM invoices
        WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
      `
        )
        .get(dayStart, dayEnd);

      result.push({
        date: format(current, 'yyyy-MM-dd'),
        day: format(current, 'EEEE'), // e.g., "Monday"
        totalRevenue: revenueRow.totalRevenue || 0,
        invoiceCount: invoiceRow.invoiceCount || 0,
        paymentCount: revenueRow.paymentCount || 0,
      });

      current = addDays(current, 1); // Move to next day
    }

    event.reply('getWeeklyRevenueChart', {
      success: true,
      message: `Weekly revenue chart for ${year}`,
      data: result,
    });
  } catch (error) {
    event.reply('getWeeklyRevenueChart', {
      success: false,
      message: `Failed to fetch weekly revenue data for ${year}`,
      error: error.message,
    });
  }
});

ipcMain.on('getYearlyRevenueChart', async (event, args) => {
  try {
    const { year } = args;
    const result: any[] = [];

    for (let month = 0; month < 12; month++) {
      // Set the start and end of the current month in the given year
      const monthStart = startOfMonth(setMonth(setYear(new Date(), year), month));
      const monthEnd = endOfMonth(monthStart);

      const start = formatISO(monthStart, { representation: 'complete' });
      const end = formatISO(monthEnd, { representation: 'complete' });

      // Get total revenue and payment count
      const revenueRow: any = dataDB
        .prepare(
          `
          SELECT SUM(paidAmount) AS totalRevenue, COUNT(*) AS paymentCount
          FROM payments
          WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
        `
        )
        .get(start, end);

      // Get total invoice count
      const invoiceRow: any = dataDB
        .prepare(
          `
          SELECT COUNT(*) AS invoiceCount
          FROM invoices
          WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
        `
        )
        .get(start, end);

      result.push({
        month: format(monthStart, 'MMM'),
        totalRevenue: revenueRow?.totalRevenue || 0,
        invoiceCount: invoiceRow?.invoiceCount || 0,
        paymentCount: revenueRow?.paymentCount || 0,
      });
    }

    event.reply('getYearlyRevenueChart', {
      success: true,
      message: `Yearly revenue chart for ${year}`,
      data: result,
    });
  } catch (error) {
    event.reply('getYearlyRevenueChart', {
      success: false,
      message: `Failed to fetch yearly revenue data`,
      error: error.message,
    });
  }
});

ipcMain.on('getReportStats', async (event, year: number) => {
  try {
    // Start and end date for the year passed
    const startOfYearDate = startOfYear(new Date(year, 0, 1)); // January 1st of the given year
    const endOfYearDate = endOfYear(new Date(year, 11, 31)); // December 31st of the given year

    const start = formatISO(startOfYearDate, { representation: 'date' }) + 'T00:00:00';
    const end = formatISO(endOfYearDate, { representation: 'date' }) + 'T23:59:59';

    // Query for total number of invoices created in that year
    const invoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS invoiceCount
      FROM invoices
      WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
    `
      )
      .get(start, end);

    // Query for total number of payments made in that year
    const paymentCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS paymentCount
      FROM payments
      WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
    `
      )
      .get(start, end);

    // Query for total number of paid invoices in that year (where dueAmount is 0)
    const paidInvoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS paidInvoiceCount
      FROM invoices i
      WHERE datetime(i.createdAt) BETWEEN datetime(?) AND datetime(?)
      AND i.paymentStatus = ?
    `
      )
      .get(start, end, 'Full Paid');

    // Query for total number of due invoices in that year (where dueAmount > 0)
    const dueInvoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS dueInvoiceCount
      FROM invoices i
      WHERE datetime(i.createdAt) BETWEEN datetime(?) AND datetime(?)
      AND i.paymentStatus = ?
    `
      )
      .get(start, end, 'Due Amount');

    // Prepare the response
    const data = {
      year: year,
      totalInvoices: invoiceCountRow.invoiceCount || 0,
      totalPayments: paymentCountRow.paymentCount || 0,
      totalPaidInvoices: paidInvoiceCountRow.paidInvoiceCount || 0,
      totalDueInvoices: dueInvoiceCountRow.dueInvoiceCount || 0,
    };

    event.reply('getReportStats', {
      success: true,
      message: `Total invoices and payments for ${year}`,
      data: data,
    });
  } catch (error) {
    event.reply('getReportStats', {
 formatISO(startOfYearDate, { representation: "date" }) + "T00:00:00";
    const end =
      formatISO(endOfYearDate, { representation: "date" }) + "T23:59:59";

    // Query for total number of invoices created in that year
    const invoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS invoiceCount
      FROM invoices
      WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
    `
      )
      .get(start, end);

    // Query for total number of payments made in that year
    const paymentCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS paymentCount
      FROM payments
      WHERE datetime(createdAt) BETWEEN datetime(?) AND datetime(?)
    `
      )
      .get(start, end);

    // Query for total number of paid invoices in that year (where dueAmount is 0)
    const paidInvoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS paidInvoiceCount
      FROM invoices i
      WHERE datetime(i.createdAt) BETWEEN datetime(?) AND datetime(?)
      AND i.paymentStatus = ?
    `
      )
      .get(start, end, "Full Paid");

    // Query for total number of due invoices in that year (where dueAmount > 0)
    const dueInvoiceCountRow: any = dataDB
      .prepare(
        `
      SELECT COUNT(*) AS dueInvoiceCount
      FROM invoices i
      WHERE datetime(i.createdAt) BETWEEN datetime(?) AND datetime(?)
      AND i.paymentStatus = ?
    `
      )
      .get(start, end, "Due Amount");

    // Prepare the response
    const data = {
      year: year,
      totalInvoices: invoiceCountRow.invoiceCount || 0,
      totalPayments: paymentCountRow.paymentCount || 0,
      totalPaidInvoices: paidInvoiceCountRow.paidInvoiceCount || 0,
      totalDueInvoices: dueInvoiceCountRow.dueInvoiceCount || 0,
    };

    event.reply("getReportStats", {
      success: true,
      message: `Total invoices and payments for ${year}`,
      data: data,
    });
  } catch (error) {
    event.reply("getReportStats", {
      success: false,
      message: `Failed to fetch data for year ${year}`,
      error: error.message,
    });
  }
});
