const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const ExcelJS = require("exceljs");
const Feedback_main = require("./models/feedbackmodel"); // Import the Feedback model
const connectDB = require("./connectDb/connect");

const { get } = require("mongoose");
const feedback = require("./routes/feedback");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();

// http://feedbackuser.s3-website.ap-south-1.amazonaws.com
app.use(
  cors({
    origin: "http://feedbackuser.s3-website.ap-south-1.amazonaws.com", // Update with your frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // If you need to allow credentials (e.g., cookies), set this to true
  })
);

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", feedback);

async function createExcelFile(data, filePath) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Feedback");

  // Define columns with specific question titles
  worksheet.columns = [
    { header: "ID", key: "id", width: 32},
    {
      header: "Which gallery was your personal favorite?",
      key: "gallery",
      width: 32,
    },
    {
      header: "How did you find out about Parsec Jaynagar?",
      key: "find",
      width: 32,
    },
    {
      header: "Roughly how much time did you spend at the gallery?",
      key: "timeSpent",
      width: 32,
    },
    {
      header: "Pick anything or everything:)",
      key: "gainFromParsec",
      width: 32,
    },
    { header: "What’s next? 👀", key: "next", width: 32 },
    { header: "Keep in touch!", key: "connect", width: 32 },
    { header: "Anything else we should know?", key: "suggestions", width: 32 },
  ];

  // Loop through each feedback entry
  data.forEach((feedbackItem) => {
    // Initialize an object to hold the row data
    const rowData = {
      id: feedbackItem._id?.toString?.() ?? "",
      gallery: "",
      find: "",
      timeSpent: "",
      gainFromParsec: "",
      next: "",
      connect: "",
      suggestions: "",

      createdAt: feedbackItem.createdAt ?? "",
    };

    // Map answers to the correct columns based on question
    feedbackItem.questions.forEach((qa) => {
      switch (qa.question) {
        case "Which gallery was your personal favorite?":
          rowData.gallery = qa.answer;
          break;
        case "How did you find out about Parsec Jaynagar?":
          rowData.find = qa.answer;
          break;
        case "Roughly how much time did you spend at the gallery?":
          rowData.timeSpent=qa.answer
          break;
        case "Pick anything or everything:)":
          rowData.gainFromParsec = qa.answer;
          break;
        case "What’s next? 👀":
          rowData.next=qa.answer;
          break;
        case "Keep in touch!":
          rowData.connect=qa.answer;
          break;
        case "Anything else we should know?":
          rowData.suggestions = qa.answer;
          break;
        default:
          break;
      }
    });

    // Add the row to the worksheet
    worksheet.addRow(rowData);
  });

  await workbook.xlsx.writeFile(filePath);
}



async function sendEmailWithAttachment(filePath) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "feedbackfeedback27@gmail.com",
      pass: "wdbk flus zgbg ctcn",
    },
  });

  let mailOptions = {
    from: "feedbackfeedback27@gmail.com",
    to: "marketing@paraminnovation.org",
    subject: "Daily Feedback Report",
    text: "Attached is the daily feedback report.",
    attachments: [{ filename: "Feedback.xlsx", path: filePath }],
  };

  // await transporter.sendMail(mailOptions);
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("sent");
    }
  });
}

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Ther server is up at ${process.env.PORT}`);
});

cron.schedule('39 12 * * 1', async () => {
    try {
        const today = new Date();
        // Calculate the start of last week (Previous Sunday at 00:00:00)
        let startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() - 6));
        startOfWeek.setHours(0, 0, 0, 0);

        // Calculate the end of this week (This Monday at 23:59:59.999)
        let endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 8));
        endOfWeek.setHours(23, 59, 59, 999);

       console.log(startOfWeek,endOfWeek)
        const weeklyFeedback = await Feedback_main.find({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        });
        // console.log(weeklyFeedback)

        if (weeklyFeedback.length > 0) {
            const filePath = './Feedback.xlsx';
            await createExcelFile(weeklyFeedback, filePath);
            await sendEmailWithAttachment(filePath);
            console.log('Weekly feedback report sent');
        } else {
            console.log('No feedback to report for this week');
        }
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
});

// cron.schedule("28 16 * * 1", async () => {
//   try {
//     const today = new Date();
//     // Start of last week (Previous Sunday at 00:00:00)
//     let startOfWeek = new Date(
//       today.setDate(today.getDate() - today.getDay() - 6)
//     );
//     startOfWeek.setHours(0, 0, 0, 0);

//     // End of this week (This Monday at 23:59:59.999)
//     let endOfWeek = new Date(
//       today.setDate(today.getDate() - today.getDay() + 8)
//     );
//     endOfWeek.setHours(23, 59, 59, 999);

//     console.log(startOfWeek, endOfWeek);

//     const weeklyFeedback = await Feedback_main.find({
//       createdAt: { $gte: startOfWeek, $lte: endOfWeek },
//     });

//     if (weeklyFeedback.length > 0) {
//       const filePath = "./Feedback.xlsx";
//       await createExcelFile(weeklyFeedback, filePath);
//       await sendEmailWithAttachment(filePath);
//       console.log("Weekly feedback report sent");
//     } else {
//       console.log("No feedback to report for this week");
//     }
//   } catch (error) {
//     console.error("Error in scheduled task:", error);
//   }
// });


