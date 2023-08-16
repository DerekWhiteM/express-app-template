import nodemailer from "nodemailer";

export function random_string(length: number) {
  let result = "";
  const char_set =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += char_set.charAt(Math.floor(Math.random() * char_set.length));
  }
  return result;
}

export function send_email(
  email_addresses: Array<string>,
  subject: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    service: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  const options = {
    from: process.env.EMAIL_ADDRESS,
    to: email_addresses,
    subject,
    html,
  };

  transporter.sendMail(options, (error, info) => error
    ? console.log(error)
    : console.log("Email sent: " + info.response)
  );
}
