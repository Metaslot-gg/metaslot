import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()
const MONGODB_URI = process.env.MONGODB_URI || '';

console.log(MONGODB_URI)

mongoose.connect(MONGODB_URI)

export const { connection } = mongoose;

connection.on('error', (e) => {
  if (e.message.code === 'ETIMEDOUT') {
    console.log(e);
    mongoose.connect(MONGODB_URI);
  }
  console.log(e);
});

connection.on('connected', () => {
  console.log(`MongoDB successfully connected to ${MONGODB_URI}`);
});

connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

process.on('SIGINT', async () => {
  await connection.close();
  console.log('Force to close the MongoDB connection');
  process.exit(0);
});

