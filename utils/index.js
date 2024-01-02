import jwt from 'jsonwebtoken';

export const generateToken = ({ obj, expiresIn = '1d' }) => {
  return jwt.sign(obj, process.env.JWT_SECRET, {
    expiresIn
  });
};

export const verifyToken = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const createUserObjectForSessionToken = (user) => {
  const {
    _id,
    name,
    email,
    auth_provider,
    message_max_length,
    feedback_message,
    inbox_max_size,
    is_inbox_enabled,
    username
  } = user;

  const formattedUserObj = {
    _id,
    name,
    email,
    auth_provider,
    message_max_length,
    feedback_message,
    inbox_max_size,
    is_inbox_enabled,
    username
  };
  return formattedUserObj;
};

export const isValidUsername = (username) => {
  /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Uppercase Letters (A-Z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
    - Length: Minimum 5, Maximum 20 characters
  */
  const regex = /^[a-zA-Z0-9_\.]+$/;

  const isValidLength = username.length >= 5 && username.length <= 20;

  const isValidPattern = regex.test(username);

  return isValidLength && isValidPattern;
};
