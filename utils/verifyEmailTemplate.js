const verifyEmailTemplate = ({ name, url }) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #333; text-align: center;">Welcome to <span style="color: #007bff;">BlinkeyIt</span> 🚀</h2>
      
      <p style="font-size: 16px; color: #555;">Dear <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        Thank you for registering with <strong>BlinkeyIt</strong>!  
        We’re excited to have you onboard our fast-moving digital ecosystem.
      </p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        To activate your account and complete your registration, please verify your email address by clicking the button below:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" target="_blank" 
           style="background-color: #007bff; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
           Verify Email
        </a>
      </div>

      <p style="font-size: 14px; color: #999; text-align: center;">
        If you didn’t create an account, please disregard this email.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} BlinkeyIt Technologies. All rights reserved.
      </p>
    </div>
  </div>
  `;
};

export default verifyEmailTemplate