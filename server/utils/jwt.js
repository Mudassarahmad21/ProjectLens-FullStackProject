// server/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'patientlens-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? '✅ Yes' : '❌ Missing');
console.log('⏱️ JWT_EXPIRE:', JWT_EXPIRE);

// Generate JWT token
export const generateToken = (userId) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
      { id: userId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  } catch (error) {
    console.error('❌ Error generating token:', error);
    throw error;
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
};

// Decode token without verification
export const decodeToken = (token) => {
  return jwt.decode(token);
};