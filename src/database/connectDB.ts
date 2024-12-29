import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        throw new Error('MONGO_URI is not defined in environment variables.');
    }
    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        throw new Error('Database connection failed');
    }
};

export default connectDB;
