const express = require("express");
const dotenv = require("dotenv")
const cors= require("cors")
const ExcelJS = require('exceljs');
const Feedback_main = require('./models/feedbackmodel'); // Import the Feedback model
const connectDB=require("./connectDb/connect");

const { get } = require("mongoose");
const feedback=require('./routes/feedback')
const nodemailer = require('nodemailer');
const cron = require('node-cron');





const app=express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use("/api",feedback);


// // Function to create an Excel file from data
// async function createExcelFile(data, filePath) {
//     console.log(data)
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Feedback');

//     worksheet.columns = [
//         { header: 'Question', key: 'question', width: 30 },
//         { header: 'Answer', key: 'answer', width: 30 },
//         { header: 'Submitted At', key: 'createdAt', width: 20 }
//     ];

//     data.forEach(item => {
//         item.questions.forEach(qa => {
//             worksheet.addRow({ ...qa, createdAt: item.createdAt });
//         });
//     });

//     await workbook.xlsx.writeFile(filePath);
// }



// async function createExcelFile(data, filePath) {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Feedback');

//     // Define columns
//     worksheet.columns = [
//         { header: 'Question', key: 'question', width: 30 },
//         { header: 'Answer', key: 'answer', width: 30 },
//         { header: 'Submitted At', key: 'createdAt', width: 20 }
//     ];

//     // Loop through each feedback entry
//     data.forEach(feedbackItem => {
//         // Check if the feedback item has questions and is an array
//         if (feedbackItem.questions && Array.isArray(feedbackItem.questions)) {
//             feedbackItem.questions.forEach(qa => {
//                 // Add a row for each question-answer pair
//                 worksheet.addRow({
//                     question: qa.question,
//                     answer: qa.answer,
//                     createdAt: feedbackItem.createdAt
//                 });
//             });
//         }
//     });

//     await workbook.xlsx.writeFile(filePath);
// }


async function createExcelFile(data, filePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Feedback');

    // Define columns with specific question titles
    worksheet.columns = [
        { header: 'Please select your gender', key: 'gender', width: 30 },
        { header: 'Please enter your age', key: 'age', width: 30 },
        { header: 'What did you gain the most from PARSEC', key: 'gainFromParsec', width: 35 },
        { header: 'How satisfied are you with your visit to PARSEC?', key: 'satisfaction', width: 40 },
        { header: 'What could we improve?', key: 'improvement', width: 35 },
        { header: 'Any suggestions or specific bad experience you would like to bring to our notice?', key: 'suggestions', width: 50 },
        { header: 'Any appreciation for a facilitator/ exhibit/ experience you had here today?', key: 'appreciation', width: 50 },
        { header: 'Submitted At', key: 'createdAt', width: 20 }
    ];

    // Loop through each feedback entry
    data.forEach(feedbackItem => {
        // Initialize an object to hold the row data
        let rowData = {
            gender: '',
            age: '',
            gainFromParsec: '',
            satisfaction: '',
            improvement: '',
            suggestions: '',
            appreciation: '',
            createdAt: feedbackItem.createdAt
        };

        // Map answers to the correct columns based on question
        feedbackItem.questions.forEach(qa => {
            switch (qa.question) {
                case 'Please select your gender':
                    rowData.gender = qa.answer;
                    break;
                case 'Please enter your age':
                    rowData.age = qa.answer;
                    break;
                case 'What did you gain the most from PARSEC':
                    rowData.gainFromParsec = qa.answer;
                    break;
                case 'How satisfied are you with your visit to PARSEC?':
                    rowData.satisfaction = qa.answer;
                    break;
                case 'What could we improve?':
                    rowData.improvement = qa.answer;
                    break;
                case 'Any suggestions or specific bad experience you would like to bring to our notice?':
                    rowData.suggestions = qa.answer;
                    break;
                case 'Any appreciation for a facilitator/ exhibit/ experience you had here today?':
                    rowData.appreciation = qa.answer;
                    break;
                // Add other cases as necessary
                default:
                    break;
            }
        });

        // Add the row to the worksheet
        worksheet.addRow(rowData);
    });

    await workbook.xlsx.writeFile(filePath);
}


// Function to send email with attachment
async function sendEmailWithAttachment(filePath) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'feedbackfeedback27@gmail.com',
            pass: 'wdbk flus zgbg ctcn'
        }
    });

    let mailOptions = {
        from: 'ashwinireddy@paraminnovation.org',
        to: 'ayelchell@gmail.com',
        subject: 'Daily Feedback Report',
        text: 'Attached is the daily feedback report.',
        attachments: [{ filename: 'Feedback.xlsx', path: filePath }]
    };

    // await transporter.sendMail(mailOptions);
    transporter.sendMail(mailOptions,function(err,data){
        if(err){
           console.log(err)
        }else{
          console.log("sent")
        }
    })
}



app.listen(process.env.PORT,async ()=>{
    await connectDB(); 
    console.log(`Ther server is up at ${process.env.PORT}`)
})


// Scheduled task to run at 23:59 every day
cron.schedule('09 17 * * *', async () => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysFeedback = await Feedback_main.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        console.log(todaysFeedback)

        if (todaysFeedback.length > 0) {
            const filePath = './Feedback.xlsx';
            await createExcelFile(todaysFeedback, filePath);
            await sendEmailWithAttachment(filePath);
            console.log('Daily feedback report sent');
        } else {
            console.log('No feedback to report for today');
        }
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
});