const transporter = require("../config/mail");

const sendResetOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",

    html: `
      <div style="
        font-family: Arial;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 12px;
      ">

        <h2>Password Reset</h2>

        <p>
          We received a request to reset your E-Commerce account password.
        </p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 8px;">
          ${otp}
        </h1>

        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

      </div>
    `,
  });
};

const sendPasswordResetSuccess = async (email) => {
  await transporter.sendMail({
    from: `"E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Successful",

    html: `
      <div style="font-family: Arial; padding: 30px;">
        <h2>Password Updated Successfully</h2>

        <p>
          Your E-Commerce account password has been successfully changed.
        </p>

        <p>
          If you did not perform this action, contact support immediately.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendResetOtp,
  sendPasswordResetSuccess,
};
