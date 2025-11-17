const forgetPasswordTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
      <h2>Hello ${name || "User"},</h2>
      <p>We received a request to reset your password for your Blinkeyit account.</p>
      <p>Please use the following One-Time Password (OTP) to proceed:</p>
      <div style="margin:20px 0; text-align:center;">
        <span style="font-size:24px; font-weight:bold; letter-spacing:3px; color:#007bff;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for the next 10 minutes. Do not share it with anyone.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>Thanks,<br/>The Blinkeyit Team</p>
    </div>
  `;
};

export default forgetPasswordTemplate