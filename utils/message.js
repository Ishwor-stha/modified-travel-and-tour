module.exports.messages = (resetLink) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; padding: 10px 0;">
            </div>
            <div style="background-color: #007BFF; color: #fff; text-align: center; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
            </div>
            <div style="padding: 20px; color: #333; line-height: 1.6;">
                <p>Hi there,</p>
                <p>We received a request to reset your password. No worries! Just click the button below to create a new one:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #28a745; color: #fff; text-decoration: none; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 5px;">Reset My Password</a>
                </div>
                <p>If you did not request this change, please ignore this email. Rest assured, your account remains secure.</p>
            </div>
            <div style="background-color: #f1f1f1; text-align: center; padding: 10px; border-radius: 0 0 8px 8px; font-size: 14px; color: #666;">
                <p>Need help? Contact us at <a href=${process.env.company_email} style="color: #007BFF; text-decoration: none;">${process.env.company_email}</a></p>
                <p>&copy; ${new Date().getFullYear()} ${process.env.copyright}</p>
            </div>
        </div>
    `;
}
