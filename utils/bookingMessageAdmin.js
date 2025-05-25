module.exports.bookingMessageAdmin = ({
  userData,
  tourData,
  transaction_uuid,
  ref_id,
  amount,
  advancePayment,
  laterPayment,
  bookingDate
}) => {
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Booking Alert</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        h2 {
          color: #2c3e50;
          text-align: center;
        }
        p {
          font-size: 15px;
          color: #333;
        }
        .details-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
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
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>📢 New Booking Received</h2>
        <p>Hello Admin,</p>
        <p>A new tour booking has been confirmed with a successful advance payment. Below are the customer and transaction details:</p>

        <table class="details-table">
          <tr>
            <td class="label">Customer Name:</td>
            <td>${userData.fullName}</td>
          </tr>
          <tr>
            <td class="label">Email:</td>
            <td>${userData.email}</td>
          </tr>
          <tr>
            <td class="label">Phone:</td>
            <td>${userData.contactNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Emergency Phone:</td>
            <td>${userData.emergencyContact || 'N/A'}</td>
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
            <td class="label">Transaction ID:</td>
            <td>${transaction_uuid}</td>
          </tr>
          <tr>
            <td class="label">Reference ID:</td>
            <td>${ref_id}</td>
          </tr>
          <tr>
            <td class="label">Total Paid:</td>
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
        </table>

        <p>Please proceed with the necessary arrangements for this booking.</p>

     <div class="footer">
          &copy; ${year} Astrapi Travel And Tour. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};
