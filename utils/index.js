import jwt from 'jsonwebtoken';

export const generateToken = ({ obj, expiresIn = '1d' }) => {
  return jwt.sign(obj, process.env.JWT_SECRET, {
    expiresIn
  });
};

export const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
