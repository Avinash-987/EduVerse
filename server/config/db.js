const mongoose = require('mongoose');

// This is a best practice for serverless environments.
// We cache the connection so that it can be reused on subsequent invocations.
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable buffering so errors are immediate
        };

        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('Please define the MONGODB_URI environment variable inside .env or in Vercel');
        }

        console.log('Attempting to create new MongoDB connection...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ New MongoDB connection established');
            return mongoose;
        }).catch(error => {
            console.error('❌ MongoDB connection error:', error.message);
            // Reset the promise on error so a new attempt can be made
            cached.promise = null; 
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // If connection fails, we re-throw the error
        // so the calling function knows about it.
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
    
    return cached.conn;
};

module.exports = connectDB;
