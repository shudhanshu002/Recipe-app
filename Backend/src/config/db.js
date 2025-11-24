import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: 🚀Good to go`);
    } catch (error) {
        console.error(`Error: 4{error.message}`);
        process.exit(1);
    }
}

export default connectDB;