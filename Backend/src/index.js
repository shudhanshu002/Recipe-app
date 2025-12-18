import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 5000;

//DB connextion
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`MONGO DB connection failed!!! `, err);
  });
