module.exports.successMessage = (res, message,statusCode) => {
  res.status(200).json({
    success: true,
    message,
  });
}