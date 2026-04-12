const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, name, verificationToken) => {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<h3>Welcome to our platform, ${name}!</h3>
    <p>Please verify your email by clicking on the following link:</p>
    <a href="${process.env.CLIENT_URL}/verify-email?token=${verificationToken}">Verify Email</a>
    <p>This link will expire in 1 hour.</p>`,
   };

   await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<h3>Hello ${name},</h3>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>`,
   };

   await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (to, name, username, password) => {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: "Welcome to Our Platform",
      html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a4a4a;">Welcome, ${name}!</h2>
            <p>Your account has been created by the administrator.</p>
            <p>Here are your login credentials:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
               <p><strong>Username/Email:</strong> ${username}</p>
               <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please log in and change your password as soon as possible for security reasons.</p>
            <p>If you didn't request this account, please contact our support team immediately.</p>
            <br>
            <p>Best regards,</p>
            <p>The Support Team</p>
         </div>
      `
   };

   try {
      await transporter.sendMail(mailOptions);
   } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
   }
};

const sendDueDateReminderEmail = async (email, name, taskTitle, projectName, dueDate) => {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Task Due Reminder: ${taskTitle}`,
      html: `
         <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 24px; border-radius: 16px 16px 0 0;">
               <h2 style="color: white; margin: 0;">⏰ Task Due Reminder</h2>
            </div>
            <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
               <p style="color: #334155;">Hello <strong>${name}</strong>,</p>
               <p style="color: #334155;">Your task is due soon:</p>
               <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #6366F1; margin: 16px 0;">
                  <p style="margin: 4px 0; color: #0f172a;"><strong>Task:</strong> ${taskTitle}</p>
                  <p style="margin: 4px 0; color: #64748b;"><strong>Project:</strong> ${projectName}</p>
                  <p style="margin: 4px 0; color: #ef4444;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
               <p style="color: #64748b; font-size: 14px;">Please ensure this task is completed on time.</p>
            </div>
         </div>
      `,
   };

   try {
      await transporter.sendMail(mailOptions);
   } catch (error) {
      console.error("Error sending due date reminder email:", error);
      throw error;
   }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendDueDateReminderEmail };
