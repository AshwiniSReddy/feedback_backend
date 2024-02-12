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


app.use(cors({
    origin: 'http://feedbackuser.s3-website.ap-south-1.amazonaws.com', // Update with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to allow credentials (e.g., cookies), set this to true
  }));


dotenv.config();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use("/",feedback);





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
            // suggestions: '',
            // appreciation: '',
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
                // case 'Any suggestions or specific bad experience you would like to bring to our notice?':
                //     rowData.suggestions = qa.answer;
                //     break;
                // case 'Any appreciation for a facilitator/ exhibit/ experience you had here today?':
                //     rowData.appreciation = qa.answer;
                //     break;
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
        from: 'feedbackfeedback27@gmail.com',
        to: 'marketing@paraminnovation.org',
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



cron.schedule('22 12 * * 1', async () => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyFeedback = await Feedback_main.find({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        });
        console.log(weeklyFeedback)

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


// cron.schedule('53 10 * * *', async () => {  // Runs every day at 10:00
//     try {
//         const allFeedback = await Feedback_main.find({}); // Fetches all documents in the Feedback_main collection
//          console.log(1111)
       

//         if (allFeedback.length > 0) {
//             const filePath = './Feedback.xlsx';
//             await createExcelFile(allFeedback, filePath); // Generate Excel file with all feedback data
//             await sendEmailWithAttachment(filePath); // Send email with the generated Excel file as an attachment
//             console.log('All feedback report sent');
//         } else {
//             console.log('No feedback data to report');
//         }
//     } catch (error) {
//         console.error('Error in scheduled task:', error);
//     }
// });

