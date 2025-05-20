module.exports.enquiryMessage = (name, email, contact, startDate, question, country, tour) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            font-size: 16px; /* Increased base font size */
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007BFF;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #007BFF;
        }
        .details {
            margin: 15px 0;
            line-height: 1.7;
        }
        .details strong {
            color: #333;
        }
        .message-box {
            background-color: #f8f9fa;
            border-left: 4px solid #007BFF;
            padding: 15px 20px;
            font-style: italic;
            color: #333;
            margin-top: 5px;
            border-radius: 6px;
            line-height: 1.6;
            font-size: 18px; /* Larger font specifically for the message */
        }
        .tour-section {
            margin-top: 25px;
            background-color: #eef5ff;
            padding: 18px;
            border-radius: 6px;
            border-left: 4px solid #0056b3;
        }
        .tour-section p {
            margin: 6px 0;
        }
        .footer {
            background-color: #f1f1f1;
            padding: 12px;
            text-align: center;
            font-size: 13px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Client Enquiry</h1>
        </div>
        <div class="content">
            <h2>Details:</h2>
            <div class="details">
                <p><strong>Client Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${contact}</p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>Country:</strong> ${country}</p>
                <p><strong>Question/Message:</strong></p>
                <div class="message-box">${question}</div>
            </div>

            <div class="tour-section">
                <h3>Tour Information:</h3>
                <p><strong>Name:</strong> ${tour.tourName}</p>
                <p><strong>Country:</strong> ${tour.country}</p>
                <p><strong>Region:</strong> ${tour.region}</p>
                <p><strong>Start Point:</strong> ${tour.startPoint}</p>
                <p><strong>End Point:</strong> ${tour.endPoint}</p>
                <p><strong>Distance:</strong> ${tour.distance}</p>
                <p><strong>Duration:</strong> ${tour.duration}</p>
                <p><strong>Max Altitude:</strong> ${tour.maxAltitude}</p>
                <p><strong>Grade:</strong> ${tour.grade}</p>
                <p><strong>Nature of Tour:</strong> ${tour.natureOfTour}</p>
                <p><strong>Activity per Day:</strong> ${tour.activityPerDay}</p>
                <p><strong>Activity Type:</strong> ${tour.activity}</p>
                <p><strong>Group Size:</strong> ${tour.groupSize}</p>
                <p><strong>Best Season:</strong> ${tour.bestSeason}</p>
                <p><strong>Meals Included:</strong> ${tour.mealsIncluded}</p>
                <p><strong>Accommodation:</strong> ${tour.accomodation}</p>
                <p><strong>Transportation:</strong> ${tour.transportation}</p>
                <p><strong>Original Price:</strong> $${tour.originalPrice}</p>
                <p><strong>Discounted Price:</strong> $${tour.discountedPrice}</p>
                <p><strong>Discount:</strong> ${tour.discount}%</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification. Please respond to the client.</p>
        </div>
    </div>
</body>
</html>
    `;
};
