import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("MONGO_URI not defined in environment variables");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {

  if (cached.conn) return cached.conn;

  if (!cached.promise) {

    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });

  }

  cached.conn = await cached.promise;

  return cached.conn;
}

export default dbConnect;