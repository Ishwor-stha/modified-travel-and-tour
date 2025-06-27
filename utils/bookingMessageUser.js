module.exports.bookingMessageUser = ({ userData,  tourData,  transaction_uuid,  ref_id,  amount,  advancePayment,  laterPayment,  bookingDate }) => {
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payment Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f9fc;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e1e4e8;
        }
        h2 {
          color: #27ae60;
          text-align: center;
        }
        p {
          font-size: 15px;
          line-height: 1.5;
          color: #333;
        }
        .details-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 8px;
          border-bottom: 1px solid #eaeaea;
        }
        .details-table td.label {
          font-weight: bold;
          color: #2c3e50;
          width: 40%;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>🎉 Payment Successful</h2>
        <p>Dear ${userData.fullName},</p>
        <p>We have successfully received your advance payment via eSewa. Below are your transaction and booking details:</p>

        <table class="details-table">
          <td class="label">Email:</td>
            <td>${userData.email}</td>
          </tr>
          <tr>
            <td class="label">Contact Number:</td>
            <td>${userData.contactNumber}</td>
          </tr>
          <tr>
            <td class="label">Emergency Contact:</td>
            <td>${userData.emergencyContact}</td>
          </tr>
          <tr>
            <td class="label">Status:</td>
            <td>COMPLETE</td>
          </tr>
          <tr>
            <td class="label">Transaction ID:</td>
            <td>${transaction_uuid}</td>
          </tr>
          <tr>
            <td class="label">Reference ID:</td>
            <td>${ref_id}</td>
          </tr>
          <tr>
            <td class="label">Total Amount Paid:</td>
            <td>Rs. ${amount}</td>
          </tr>
          <tr>
            <td class="label">Advance Payment:</td>
            <td>Rs. ${advancePayment}</td>
          </tr>
          <tr>
            <td class="label">Remaining Payment:</td>
            <td>Rs. ${laterPayment}</td>
          </tr>
          <tr>
            <td class="label">Tour Package:</td>
            <td>${tourData.tourName}</td>
          </tr>
          <tr>
            <td class="label">Booking Date:</td>
            <td>${bookingDate}</td>
          </tr>
          <tr>
          
        </table>

        <p>If you have any questions, feel free to reply to this email.</p>

        <p>Thank you for choosing us!</p>

        <div class="footer">
          &copy; ${year} Ishwor Travel And Tour. All rights reserved.

         <!-- &copy; ${year} Astrapi Travel And Tour. All rights reserved.-->
        </div>
      </div>
    </body>
    </html>
  `;
};
