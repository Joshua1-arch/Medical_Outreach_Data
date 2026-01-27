import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js DNS resolution issues (ESERVFAIL)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if not supported
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    console.error("❌ MONGODB CONNECTION ERROR ❌");
    console.error("---------------------------------------------------");
    console.error("The application could not connect to MongoDB Atlas.");
    console.error("Common Cause: Your IP address is not whitelisted.");
    console.error("SOLUTION: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0)");
    console.error("---------------------------------------------------");
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
