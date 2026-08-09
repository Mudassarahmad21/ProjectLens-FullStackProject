// 404 Not Found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Validation middleware for IDs
export const validateId = (req, res, next) => {
  const { subjectId, hadmId } = req.params;
  
  if (subjectId && isNaN(parseInt(subjectId))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subjectId format. Must be a number.'
    });
  }
  
  if (hadmId && isNaN(parseInt(hadmId))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid hadmId format. Must be a number.'
    });
  }
  
  next();
};