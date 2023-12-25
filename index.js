import colors from 'colors';
import app from './app.js';

// PORT
const PORT = process.env.PORT || 8000;

// Server
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(colors.magenta('Server is live on: http://localhost:%d'), PORT);
  } else {
    console.log(colors.magenta('Server is live on PORT: %d'), PORT);
  }
});
