const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. create a transporter
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //Activate in gmail "less secure app" option. Send grid better.
  });

  //2. Define the email Options
  const mailOptions = {
    from: 'C Davis <cdavis@joegalaxy.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html: can specify html options
  };

  //3. Send the email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
