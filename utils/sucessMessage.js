module.exports.successMessage = (res, message,statusCode) => {
  res.status(statusCode).json({
    success: true,
    message,
  });
}