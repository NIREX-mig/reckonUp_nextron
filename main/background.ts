import path from "path";
import { app, ipcMain, dialog, BrowserWindow } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import EventResponse from "./helpers/EventResponse";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import sendForgotPasswordEmail, {
  sendFeedbackEmail,
} from "./helpers/sendEmail";
import fs from "node:fs";
import { autoUpdater } from "electron-updater";
import * as XLSX from "xlsx";
import { tempSecret, genrateOtp, MongoURI } from "./helpers/utils";
import moment from "moment";
import db from "./helpers/db";

// Basic flags for Electron updater
autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

// mongodb variables
let client: MongoClient | null = null;

// async function connectToDb() {
//   try {
//     client = new MongoClient(MongoURI);
//   } catch (error) {
//     const dialogOpts = {
//       type: "error",
//       buttons: ["Exit"],
//       title: "Error Occured!",
//       message: "Something went wrong!",
//       detail: `${
//         error.message ? error.message : "Please Check database and try again."
//       }`,
//     };
//     dialog.showMessageBox(dialogOpts).then(() => {
//       app.quit();
//     });
//   }
// }

// async function checkUserIsExistOrNot() {
//   const db = client.db("reckonup");
//   const collection = db.collection("users");

//   const existedUser = await collection.findOne({ username: "app-admin" });

//   if (!existedUser) {
//     const salt = await bcrypt.genSalt(10);

//     const newpassword = await bcrypt.hash("12345", salt);

//     await collection.insertOne({
//       username: "app-admin",
//       email: "akay93796@gmail.com",
//       password: newpassword,
//     });

//     return;
//   }

//   return;
// }

async function checkUserIsExistOrNot() {
  try {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const existedUser = stmt.get("app-admin");

    if (!existedUser) {
      const salt = await bcrypt.genSalt(10);
      const newpassword = await bcrypt.hash("12345", salt);

      const insertStmt = db.prepare(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
      );
      insertStmt.run("app-admin", "akay93796@gmail.com", newpassword);
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
}

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const appDataPath = app.getPath("userData");
const uploadPath = path.join(appDataPath, "Assets");

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

(async () => {
  await app.whenReady();

  // connecting with database
  // await connectToDb();

  // check user is existed or not if not it create user
  await checkUserIsExistOrNot();

  // Create the splash screen
  splashWindow = new BrowserWindow({
    width: 450,
    height: 270,
    frame: false,
    backgroundColor: "#f9f7fd",
    roundedCorners: true,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    resizable: false,
  });

  mainWindow = createWindow("main", {
    title: "ReckonUp - Devloped by NIreX",
    width: 1366,
    height: 768,
    show: false, // Hide initially
    webPreferences: {
      // devTools: false, // Disable DevTools
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.removeMenu();
  mainWindow.center();
  mainWindow.setMinimumSize(1366, 768);

  if (isProd) {
    await splashWindow.loadURL("app://./SplashScreen");
    await mainWindow.loadURL("app://./home");
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

app.on("window-all-closed", () => {
  client.close();
  app.quit();
});

/*------------------------------
    Auto Update Section 
-------------------------------*/

autoUpdater.on("update-available", () => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Application Update",
    message: "New Update Avilable",
    detail: "ReckonUp have new Update Released",
  };
  dialog.showMessageBox(mainWindow, dialogOpts).then(() => {
    autoUpdater.downloadUpdate();
  });
});

autoUpdater.on("update-downloaded", () => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: "Update Download Successfully",
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// Expose events using IPC
// -----------------------------
//     User Events
// -----------------------------


ipcMain.on("login", async (event, args) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("users");

    // finding the user
    const user = await collection.findOne({ username: args.username });

    if (!user) {
      throw new EventResponse(false, "Invalid Credential!", {});
    }

    // check the password
    const isPasswordCorrect = await bcrypt.compare(
      args.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new EventResponse(false, "Invalid Credential!", {});
    }

    // create response and emmit event
    const response = new EventResponse(true, "Login successfully.", user);
    event.reply("login", response);
  } catch (err) {
    event.reply("login", err);
  }
});

// ForgotPassword email send Event
ipcMain.on("forgotpasswordemail", async (event, args) => {
  try {
    const db = client.db("reckonup");
    const { username } = args;

    // connecting with database
    const collection = db.collection("users");
    // finding the user
    const user = await collection.findOne({ username });

    if (!user) {
      throw new EventResponse(false, "Invalid Username!", {});
    }

    // Genrate otp
    const otp = genrateOtp(6);

    // send forgot password email
    await sendForgotPasswordEmail(user.email, user.username, otp);

    // create otp hash
    const salt = await bcrypt.genSalt(10);
    const otphash = await bcrypt.hash(otp.toString(), salt);

    // genrate token for forgot email
    const payload = {
      id: user._id,
      username: user.username,
    };

    const tempToken = jwt.sign(payload, tempSecret, {
      expiresIn: "10m",
    });

    // update otphash in database
    await collection.updateOne(
      { username },
      { $set: { forgotOtpHash: otphash } }
    );

    // create response and emmit event
    const response = new EventResponse(
      true,
      "Otp Sent To Your Email.",
      tempToken
    );
    event.reply("forgotpasswordemail", response);
  } catch (err) {
    event.reply("forgotpasswordemail", err);
  }
});

// validate otp Event
ipcMain.on("validateotp", async (event, args) => {
  try {
    const { otp, token } = args;

    const db = client.db("reckonup");
    const collection = db.collection("users");

    // decord the token
    const decoredeToken = jwt.verify(token, tempSecret);

    // finding the user
    const user = await collection.findOne({ username: decoredeToken.username });

    if (!user) {
      throw new EventResponse(false, "Something Went Wrong!", {});
    }

    // compair otp hash
    const isOtpCorrect = await bcrypt.compare(otp, user?.forgotOtpHash);

    if (!isOtpCorrect) {
      throw new EventResponse(false, "Incorrect Opt!", {});
    }

    // update otp validation in database
    collection.updateOne(
      { username: decoredeToken.username },
      { $set: { otpValidation: "success" } }
    );

    // create response and emmit event
    const response = new EventResponse(true, "success", {});
    event.reply("validateotp", response);
  } catch (err) {
    event.reply("validateotp", err);
  }
});

// forgot password Event
ipcMain.on("forgotpassword", async (event, args) => {
  try {
    const { newpassword, token } = args;

    const db = client.db("reckonup");
    const collection = db.collection("users");

    if (!token) {
      throw new EventResponse(false, "Unautherized Access!", {});
    }
    // decord the token
    const decoredeToken = jwt.verify(token, tempSecret);

    // finding the user
    const user = await collection.findOne({ username: decoredeToken.username });

    if (!user) {
      throw new EventResponse(false, "Unautherized Access!", {});
    }

    if (!user.otpValidation) {
      throw new EventResponse(false, "Unautherized Access!", {});
    }

    // create hash of new password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(newpassword, salt);

    // update password
    await collection.updateOne(
      { username: decoredeToken.username },
      { $set: { password: hashPass } }
    );

    // remove password hash and otpvalidation
    await collection.updateOne(
      { username: decoredeToken.username },
      {
        $unset: {
          forgotOtpHash: 1,
          otpValidation: 1,
        },
      },
      {
        new: true,
      }
    );

    // create response and emmit event
    const response = new EventResponse(
      true,
      "Successfully Changed Password.",
      {}
    );
    event.reply("forgotpassword", response);
  } catch (err) {
    event.reply("forgotpassword", err);
  }
});

// -----------------------------
//     Invoice Events
// ----------------------------

// Create inovice Event
ipcMain.on("createinvoice", async (event, args) => {
  try {
    const { invoiceData } = await args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");
    const paymentCollection = db.collection("payments");

    const paymentHistoryObj = {
      paidAmount: Number(invoiceData.paymentHistory[0].paidAmount),
      dueAmount: Number(invoiceData.paymentHistory[0].dueAmount),
      createdAt: new Date(),
    };

    const insertedPayment = await paymentCollection.insertOne(
      paymentHistoryObj
    );

    const isInserted = await paymentCollection.findOne({
      _id: insertedPayment.insertedId,
    });

    if (!isInserted) {
      throw new EventResponse(false, "Faild to make payment!", {});
    }

    const invoiceObj = {
      // customer Details
      customerName: invoiceData.customerName,
      customerPhone: invoiceData.customerPhone,
      customerAddress: invoiceData.customerAddress,

      // exchange Details
      exchange: invoiceData.exchange,
      exchangeCategory:
        invoiceData.exchangeCategory === "select"
          ? "N/A"
          : invoiceData.exchangeCategory,
      exchangeWeight:
        invoiceData.exchangeWeight.length === 0
          ? "N/A"
          : invoiceData.exchangeWeight,
      exchangePercentage:
        invoiceData.exchangePercentage.length === 0
          ? "N/A"
          : invoiceData.exchangePercentage,
      exchangeAmt:
        invoiceData.exchangeAmt.length === 0 ? "N/A" : invoiceData.exchangeAmt,

      // product Details
      productList: invoiceData.productList,

      // gst Details
      GST: invoiceData.GST,
      GSTPercentage:
        invoiceData.GSTPercentage.length === 0
          ? "N/A"
          : invoiceData.GSTPercentage,
      GSTAMT: invoiceData.GSTAMT,

      // payment details
      discount: invoiceData.discount,
      paymentHistory: [isInserted._id],

      // invoice Details
      invoiceNo: invoiceData.invoiceNo,
      grossAmt: invoiceData.grossAmt,
      totalAmt: invoiceData.totalAmt,
      createdAt: new Date(),
    };

    await collection.insertOne(invoiceObj);

    const response = new EventResponse(true, "Invoice Saved SuccessFully.", {});
    event.reply("createinvoice", response);
  } catch (err) {
    event.reply("createinvoice", err);
  }
});

// fetch invoice by InvoiceNo Event
ipcMain.on("fetchbyinvoiceno", async (event, args) => {
  try {
    const { invoiceNo } = args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const invoice = await collection
      .aggregate([
        {
          $match: {
            invoiceNo: invoiceNo,
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    if (!invoice || invoice.length === 0) {
      throw new EventResponse(false, "Invalid Invoice Number!", {});
    }

    const data = {
      totalPages: 1,
      currentPage: 1,
      invoices: invoice,
    };

    // create response and emmit event
    const response = new EventResponse(true, "Success", data);
    event.sender.send("fetchbyinvoiceno", response);
  } catch (err) {
    event.sender.send("fetchbyinvoiceno", err);
  }
});

// fetch invoice by Customer name Event
ipcMain.on("fetchbycustomername", async (event, args) => {
  try {
    const { customerName, pageNo } = args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const skip = (page - 1) * limit; // Calculate skip value

    const invoices = await collection
      .aggregate([
        {
          $match: {
            customerName: customerName,
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    if (!invoices || invoices.length === 0) {
      throw new EventResponse(false, "Invalid Customer Name!", {});
    }

    const total = await collection
      .find({ customerName: customerName })
      .toArray();

    const data = {
      totalPages: Math.ceil(total.length / limit),
      currentPage: page,
      invoices: invoices,
    };
    // create response and emmit event
    const response = new EventResponse(true, "Success", data);
    event.reply("fetchbycustomername", response);
  } catch (err) {
    event.reply("fetchbycustomername", err);
  }
});

// fetch invoice by date Range Event
ipcMain.on("fetchbydaterange", async (event, args) => {
  try {
    const { startingDate, endingDate, pageNo } = args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const skip = (page - 1) * limit; // Calculate skip value

    // Convert dates and subtract one day from startingDate
    const adjustedStartDate = new Date(startingDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() - 1); // Subtract 1 day

    const adjustedEndDate = new Date(endingDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const invoices = await collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gt: adjustedStartDate,
              $lt: adjustedEndDate,
            },
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    const total = await collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: adjustedStartDate,
              $lte: adjustedEndDate,
            },
          },
        },
      ])
      .toArray();

    const data = {
      totalPages: Math.ceil(total.length / limit),
      currentPage: page,
      invoices: invoices,
    };

    // // create response and emmit event
    const response = new EventResponse(true, "Success", data);
    event.reply("fetchbydaterange", response);
  } catch (err) {
    event.reply("fetchbydaterange", err);
  }
});

// fetch Monthly invoice Event
ipcMain.on("fetchmonthlyinvoice", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    // create today date
    const currentDate = new Date();
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const invoices = await collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstDayOfCurrentMonth,
              $lte: lastDayOfCurrentMonth,
            },
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    // create response and emmit event
    const response = new EventResponse(true, "Success", invoices);
    event.reply("fetchmonthlyinvoice", response);
  } catch (err) {
    event.reply("fetchmonthlyinvoice", err);
  }
});

// total count of invoice Event
ipcMain.on("totalcountofinvoice", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    // count invoice
    const count = await collection.countDocuments();

    // create response and emmit event
    const response = new EventResponse(true, "Success", count);
    event.reply("totalcountofinvoice", response);
  } catch (err) {
    event.reply("totalcountofinvoice", err);
  }
});

// Get all Invoices Event
ipcMain.on("getallinvoice", async (event, args) => {
  try {
    const { pageNo } = await args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const page = parseInt(pageNo) || 1; // Default to page 1
    const limit = 40; // Default to 40 items per page
    const skip = (page - 1) * limit; // Calculate skip value

    const invoices = await collection
      .aggregate([
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    const total = await collection.countDocuments({});

    const data = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      invoices: invoices,
    };

    // create response and emmit event
    const response = new EventResponse(true, "Success", data);
    event.reply("getallinvoice", response);
  } catch (err) {
    event.reply("getallinvoice", err);
  }
});

//tracks Event
ipcMain.on("tracks", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    // =======================
    //    find total invoice
    // =======================
    const totalInvoice = await collection.countDocuments();

    // =======================
    //    find total sales
    // =======================
    const totalSales = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalSaleAmount: { $sum: "$totalAmt" },
          },
        },
      ])
      .toArray();

    // =======================
    //  find last month groth
    // =======================
    // Get the current date and calculate the first and last date of the last month
    const currentDate = new Date();
    const firstDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    // Perform aggregation to calculate total sales for last month
    const lastMonthGrowth = await collection
      .aggregate([
        {
          $match: {
            // Match documents where the date is within the last month
            createddAt: {
              $gte: firstDayOfLastMonth,
              $lte: lastDayOfLastMonth,
            },
          },
        },
        {
          $group: {
            _id: null, // Group all matching documents together
            totalAmount: { $sum: "$totalAmt" }, // Sum the "amount" field
          },
        },
      ])
      .toArray();

    // ========================
    //  find this month Growth
    // ========================
    const firstDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Perform aggregation to calculate total sales for the current month, including today's sales
    const monthlyGrowth = await collection
      .aggregate([
        {
          $match: {
            // Match documents where the date is within the current month (including today)
            createdAt: {
              $gte: firstDayOfCurrentMonth,
              $lte: lastDayOfCurrentMonth,
            },
          },
        },
        {
          $group: {
            _id: null, // Group all matching documents together
            totalAmount: { $sum: "$totalAmt" }, // Sum the "amount" field
          },
        },
      ])
      .toArray();

    // create trackData
    const tracksData = [
      {
        title: "Total Sales",
        value: `₹ ${
          totalSales.length === 0 ? 0 : totalSales[0].totalSaleAmount
        } `,
        icon: "FaDollarSign",
      },
      {
        title: "Total Invoices",
        value: `${totalInvoice || 0}`,
        icon: "FiFileText",
      },
      {
        title: "Monthly Growth",
        value: `₹${
          monthlyGrowth.length === 0 ? 0 : monthlyGrowth[0].totalAmount || 0
        }`,
        icon: "ImStatsDots",
      },
      {
        title: "Last Month Growth",
        value: `₹${
          lastMonthGrowth.length === 0 ? 0 : lastMonthGrowth[0].totalAmount
        }`,
        icon: "TfiStatsUp",
      },
    ];

    // create response and emmit event
    const response = new EventResponse(true, "Success", tracksData);
    event.sender.send("tracks", response);
  } catch (err) {
    event.sender.send("tracks", err);
  }
});

// Get Due Invoices Event
ipcMain.on("getdueinvoices", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const dueData = await collection
      .aggregate([
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            paidAmount: { $sum: "$paymentHistory.paidAmount" },
            due: { $arrayElemAt: ["$paymentHistory.dueAmount", 0] },
          },
        },
        {
          $match: {
            due: { $gt: 0 }, // Filter to only show documents with due > 0
          },
        },
        {
          $project: {
            _id: 1,
            customerName: 1,
            customerAddress: 1,
            customerPhone: 1,
            invoiceNo: 1,
            paidAmount: 1,
            due: 1,
            totalAmt: 1,
            discount: 1,
          },
        },
      ])
      .toArray();

    // create response and emmit event
    const response = new EventResponse(true, "Success", dueData);
    event.reply("getdueinvoices", response);
  } catch (err) {
    event.reply("getdueinvoices", err);
  }
});

// -----------------------------
//     Setting Events
// ----------------------------

// create invoice Event
ipcMain.on("createsetting", async (event, args) => {
  try {
    const {
      ownerName,
      mobileNumber,
      whatsappNumber,
      address,
      shopName,
      GSTNO,
    } = args;

    const db = client.db("reckonup");
    const collection = db.collection("settings");

    // check existed setting
    const existedSetting = await collection.findOne();

    if (existedSetting) {
      await collection.updateOne(
        { _id: existedSetting._id },
        {
          $set: {
            ownerName,
            mobileNumber,
            whatsappNumber,
            address,
            shopName,
            GSTNO,
          },
        }
      );

      const response = new EventResponse(true, "Updated Successfully", {});
      event.reply("createsetting", response);
      return;
    }

    const settingData = {
      ownerName: ownerName,
      mobileNumber: mobileNumber,
      whatsappNumber: whatsappNumber,
      address: address,
      GSTNO: GSTNO,
      shopName: shopName,
      createdAt: new Date(),
    };

    await collection.insertOne(settingData);

    // create response and emmit event
    const response = new EventResponse(true, "Updated Successfully.", {});
    event.reply("createsetting", response);
  } catch (err) {
    event.reply("createsetting", err);
  }
});

// fetch setting Event
ipcMain.on("fetchsetting", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("settings");

    const setting = await collection.find().toArray();

    const newSetting = setting[0];

    if (setting.length === 0) {
      const newSetting = {
        ownerName: "not set",
        mobileNumber: "not set",
        whatsappNumber: " not set",
        address: " not set",
        shopName: "not set",
        GSTNO: " not set",
      };

      const response = new EventResponse(true, "Success", newSetting);
      event.reply("fetchsetting", response);
      return;
    }

    // create response and emmit event
    const response = new EventResponse(true, "Success", newSetting);
    event.reply("fetchsetting", response);
  } catch (err) {
    event.reply("fetchsetting", err);
  }
});

// upload qr code for payment Event
ipcMain.on("uploadqr", async (event, args) => {
  try {
    const { fileName, qrimg } = args;

    const db = client.db("reckonup");
    const collection = db.collection("settings");

    const setting = await collection.find().toArray();
    const oldfilePath = setting[0]?.qrImg;

    const base64Data = qrimg.replace(/^data:image\/\w+;base64,/, "");
    const filePath = path.join(uploadPath, fileName);

    // newly upload qr in locally and path save in db
    if (!oldfilePath || oldfilePath === null) {
      fs.writeFile(filePath, base64Data, "base64", async (err) => {
        if (err) {
          throw new EventResponse(false, err.message, {});
        } else {
          if (setting.length === 0) {
            await collection.insertOne({ qrImg: filePath });
          }

          await collection.updateOne(
            { _id: setting[0]._id },
            { $set: { qrImg: filePath } }
          );

          const response = new EventResponse(
            true,
            "Successfully qr update.",
            filePath
          );
          event.reply("uploadqr", response);
          return;
        }
      });
    }

    // update qr in locally and path save in db
    if (oldfilePath) {
      // check file is exits or not locally
      if (fs.existsSync(oldfilePath)) {
        // remove file for oldpath
        fs.unlinkSync(oldfilePath);
        // add new file and update path in db
        fs.writeFile(filePath, base64Data, "base64", async (err) => {
          if (err) {
            throw new EventResponse(false, err.message, {});
          } else {
            await collection.updateOne(
              { _id: setting[0]._id },
              { $set: { qrImg: filePath } }
            );

            const response = new EventResponse(
              true,
              "Successfully logo update.",
              filePath
            );

            event.reply("uploadqr", response);
            return;
          }
        });
      } else {
        await collection.updateOne(
          { _id: setting[0]._id },
          { $unset: { qrImg: 1 } }
        );
      }
    }
  } catch (err) {
    event.reply("uploadqr", err);
  }
});

// get Qr code Event
ipcMain.on("getqr", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("settings");

    const setting = await collection.find().toArray();
    const filePath = setting[0].qrImg;

    if (!filePath || filePath === null) {
      throw new EventResponse(false, "Failed!", {});
    }

    const imageBuffer = fs.readFileSync(filePath);
    const imageSrc = `data:/image/png;base64, ${imageBuffer.toString(
      "base64"
    )}`;

    // create response and emmit event
    const response = new EventResponse(true, "Success", imageSrc);
    event.reply("getqr", response);
  } catch (err) {
    event.reply("getqr", err);
  }
});

// upload Invoice logo Event
ipcMain.on("upload-logo", async (event, args) => {
  try {
    const { fileName, logo } = args;

    const db = client.db("reckonup");
    const collection = db.collection("settings");

    const setting = await collection.find().toArray();
    const oldfilePath = setting[0]?.logo;

    const base64Data = logo.replace(/^data:image\/\w+;base64,/, "");
    const filePath = path.join(uploadPath, fileName);

    // newly upload qr in locally and path save in db
    if (!oldfilePath || oldfilePath === null) {
      fs.writeFile(filePath, base64Data, "base64", async (err) => {
        if (err) {
          throw new EventResponse(false, err.message, {});
        } else {
          if (setting.length === 0) {
            await collection.insertOne({ logo: filePath });
          }

          await collection.updateOne(
            { _id: setting[0]._id },
            { $set: { logo: filePath } }
          );

          const response = new EventResponse(
            true,
            "Successfully qr update.",
            filePath
          );
          event.reply("uploadqr", response);
          return;
        }
      });
    }

    // update qr in locally and path save in db
    if (oldfilePath) {
      // check file is exits or not locally
      if (fs.existsSync(oldfilePath)) {
        // remove file for oldpath
        fs.unlinkSync(oldfilePath);
        // add new file and update path in db
        fs.writeFile(filePath, base64Data, "base64", async (err) => {
          if (err) {
            throw new EventResponse(false, err.message, {});
          } else {
            await collection.updateOne(
              { _id: setting[0]._id },
              { $set: { logo: filePath } }
            );

            const response = new EventResponse(
              true,
              "Successfully logo update.",
              filePath
            );

            event.reply("uploadqr", response);
            return;
          }
        });
      } else {
        await collection.updateOne(
          { _id: setting[0]._id },
          { $unset: { logo: 1 } }
        );
      }
    }
  } catch (err) {
    event.reply("upload-logo", err);
  }
});

// Get Logo Event
ipcMain.on("get-logo", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("settings");

    const setting = await collection.find().toArray();
    const filePath = setting[0].logo;

    if (!filePath || filePath === null) {
      throw new EventResponse(false, "Failed!", {});
    }

    const imageBuffer = fs.readFileSync(filePath);
    const logoSrc = `data:/image/png;base64, ${imageBuffer.toString("base64")}`;

    // create response and emmit event
    const response = new EventResponse(true, "Success", logoSrc);
    event.reply("get-logo", response);
  } catch (err) {
    event.reply("get-logo", err);
  }
});

// Exprt to excel Event
ipcMain.on("export2excel", async (event, args) => {
  try {
    const { date } = args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    // Convert dates and subtract one day from startingDate
    const adjustedStartDate = new Date(date.start);
    adjustedStartDate.setDate(adjustedStartDate.getDate() - 1); // Subtract 1 day

    const adjustedEndDate = new Date(date.end);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const invoices = await collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gt: adjustedStartDate,
              $lt: adjustedEndDate,
            },
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $project: {
                  _id: 0,
                },
              },
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .toArray();

    if (invoices.length === 0) {
      throw new EventResponse(false, "Don't have Any Invoice!", {});
    }

    let headerData = [
      [
        "InvoiceNO",
        "Name",
        "PhoneNo",
        "Address",
        "exchangeCategory",
        "exchangeWeight",
        "exchangePercentage",
        "exchangeAmount",
        "ProName",
        "ProCategory",
        "ProRate",
        "proWeight",
        "ProQuantity",
        "ProMaking",
        "ProAmount",
        "Gst(%)",
        "Discount",
        "Total",
      ],
    ];
    let merges = [];
    let rowIndex = 1; // Start after the header

    invoices?.forEach((customer) => {
      let startRow = rowIndex;

      customer.productList.forEach((product) => {
        headerData.push([
          customer.invoiceNo,
          customer.customerName,
          customer.customerPhone,
          customer.customerAddress,
          customer.exchangeCategory,
          customer.exchangeWeight,
          customer.exchangePercentage,
          customer.exchangeAmt,
          product.productName,
          product.productCategory,
          product.rate.toString(),
          product.netWeight.toString(),
          product.quantity.toString(),
          product.makingCost.toString(),
          product.amount.toString(),
          customer.GSTPercentage.toString(),
          customer.discount.toString(),
          customer.totalAmt.toString(),
        ]);
        rowIndex++;
      });

      // Merge columns
      merges.push({ s: { r: startRow, c: 0 }, e: { r: rowIndex - 1, c: 0 } }); // Merge innvoiceNO column
      merges.push({ s: { r: startRow, c: 1 }, e: { r: rowIndex - 1, c: 1 } }); // Merge name column
      merges.push({ s: { r: startRow, c: 2 }, e: { r: rowIndex - 1, c: 2 } }); // Merge phoneNO column
      merges.push({ s: { r: startRow, c: 3 }, e: { r: rowIndex - 1, c: 3 } }); // Merge address column
      merges.push({ s: { r: startRow, c: 4 }, e: { r: rowIndex - 1, c: 4 } }); // Merge exchangeCategory column
      merges.push({ s: { r: startRow, c: 5 }, e: { r: rowIndex - 1, c: 5 } }); // Merge exchangeWeight column
      merges.push({ s: { r: startRow, c: 6 }, e: { r: rowIndex - 1, c: 6 } }); // Merge exchangePercentage column
      merges.push({ s: { r: startRow, c: 7 }, e: { r: rowIndex - 1, c: 7 } }); // Merge exchangeAmount column
      merges.push({
        s: { r: startRow, c: 15 },
        e: { r: rowIndex - 1, c: 15 },
      }); // Merge gst column
      merges.push({
        s: { r: startRow, c: 16 },
        e: { r: rowIndex - 1, c: 16 },
      }); // Merge discount column
      merges.push({
        s: { r: startRow, c: 17 },
        e: { r: rowIndex - 1, c: 17 },
      }); // Merge total column
    });

    // Step 4: Get Desktop Path
    const desktopPath = path.join(
      app.getPath("desktop"),
      `exported_invoice_(${moment(date.start).format("DD-MM-YYYY")}-${moment(
        date.end
      ).format("DD-MMM-YYYY")}).xlsx`
    );

    // Convert data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    ws["!merges"] = merges; // Apply merging
    ws["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    // Step 5: Write the Excel file to Desktop
    XLSX.writeFile(wb, desktopPath);

    const response = new EventResponse(true, "Successfully Saved!", {});
    event.reply("export2excel", response);
  } catch (err) {
    event.reply("export2excel", err);
  }
});

ipcMain.on("feedback", async (event, args) => {
  try {
    const { message } = await args;
    await sendFeedbackEmail(message);
    const response = new EventResponse(true, "Successfully Send Feedback.", {});
    event.reply("feedback", response);
  } catch (err) {
    event.reply("feedback", err);
  }
});

//---------------------------------
//       Payment Events
//---------------------------------
ipcMain.on("payment", async (event, args) => {
  try {
    const { paidAmount, invoiceNo } = args;

    const db = client.db("reckonup");
    const collection = db.collection("invoices");
    const paymentCollection = db.collection("payments");

    if (!paidAmount || Number(paidAmount) === 0) {
      throw new EventResponse(false, "Invalid Amount!", {});
    }

    // find invoice
    const invoice = await collection
      .aggregate([
        {
          $match: {
            invoiceNo: invoiceNo,
          },
        },
        {
          $lookup: {
            from: "payments",
            foreignField: "_id",
            localField: "paymentHistory",
            as: "paymentHistory",
            pipeline: [
              {
                $sort: {
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    if (invoice.length === 0) {
      throw new EventResponse(false, "Something Went Wrong!", {});
    }

    // calculate due amount
    const dueAmount =
      Number(
        invoice[0].paymentHistory[invoice[0].paymentHistory.length - 1]
          .dueAmount
      ) - Number(paidAmount);

    if (dueAmount < 0) {
      throw new EventResponse(false, "Invalid Amount!", {});
    }

    const paymentObj = {
      paidAmount: Number(paidAmount),
      dueAmount: dueAmount,
      createdAt: new Date(),
    };

    const addPayment = await paymentCollection.insertOne(paymentObj);

    const isAdded = await paymentCollection.findOne({
      _id: addPayment.insertedId,
    });

    if (!isAdded) {
      throw new EventResponse(false, "Faild To Payment!", {});
    }

    const updatePaymentHistory = await collection.findOneAndUpdate(
      {
        invoiceNo: invoiceNo,
      },
      {
        $addToSet: {
          paymentHistory: addPayment.insertedId,
        },
      }
    );

    if (!updatePaymentHistory) {
      throw new EventResponse(false, "Faild to payment!", {});
    }

    const response = new EventResponse(true, "Payment Add Successfully", {});

    event.reply("payment", response);
  } catch (error) {
    event.reply("payment", error);
  }
});

//---------------------------------
//       Suggestion Events
//---------------------------------
ipcMain.on("customer-suggestion", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const suggestionName = await collection
      .aggregate([
        {
          $group: {
            _id: "$customerName", // Group by customer name
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
          },
        },
      ])
      .toArray();

    if (suggestionName.length === 0) {
      const response = new EventResponse(true, "No name avilable", []);
      event.reply("customer-suggestion", response);
      return;
    }

    const response = new EventResponse(true, "success", suggestionName);
    event.reply("customer-suggestion", response);
  } catch (err) {
    event.reply("customer-suggestion", err);
  }
});

ipcMain.on("product-suggestion", async (event) => {
  try {
    const db = client.db("reckonup");
    const collection = db.collection("invoices");

    const suggestionProduct = await collection
      .aggregate([
        {
          $unwind: "$productList", // Flatten the productList array
        },
        {
          $group: {
            _id: "$productList.productName", // Group by product name to get unique values
            phone: { $first: "$customerPhone" }, // get phone number
            address: { $first: "$customerAddress" }, // get adress
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            phone: 1,
            address: 1,
          },
        },
      ])
      .toArray();

    if (suggestionProduct.length === 0) {
      const response = new EventResponse(true, "No name avilable", []);
      event.reply("product-suggestion", response);
      return;
    }

    const response = new EventResponse(true, "success", suggestionProduct);
    event.reply("product-suggestion", response);
  } catch (err) {
    event.reply("product-suggestion", err);
  }
});
