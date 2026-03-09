const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, message = 'Server Error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };