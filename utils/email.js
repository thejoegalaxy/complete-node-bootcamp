const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

//new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    //console.log(url);
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `C Davis <${process.env.EMAIL_FROM}>`;
  }

  newTransport(mailOptions) {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid
      // return nodemailer.createTransport({
      //   service: 'SendGrid', //TODO: setup a known mail service, not Sendgrid.
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
      return 1; // for know, not implemented.
      //console.log('Production environment');
      // return nodemailer
      //   .createTransport({
      //     //service: 'Gmail',
      //     host: process.env.MAILSAC_HOST,
      //     port: process.env.MAILSAC_PORT,
      //     secure: false,
      //     auth: {
      //       user: process.env.MAILSAC_USERNAME,
      //       pass: process.env.MAILSAC_PASSWORD,
      //     },
      //     //Activate in gmail "less secure app" option. Send grid better.
      //   })
      //   .sendMail(mailOptions); //had to put this here, wasn't working below.
    }

    return nodemailer
      .createTransport({
        //service: 'Gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        //Activate in gmail "less secure app" option. Send grid better.
      })
      .sendMail(mailOptions); //had to put this here, wasn't working below.
  }

  async send(template, subject) {
    //console.log(subject);
    //send the actual email
    // 1 Render html based on a pug template.
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2. Define email options.
    //2. Define the email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
      //html: can specify html options
    };

    //3. create a transport and send email.
    await this.newTransport(mailOptions);
    //await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
