import dbConnect from './lib/db';
import User from './models/User';

async function test() {
    try {
        console.log('Testing DB connection...');
        await dbConnect();
        console.log('Successfully connected to DB.');
        const count = await User.countDocuments();
        console.log(`Found ${count} users.`);
        process.exit(0);
    } catch (error) {
        console.error('DB Connection Failed:', error);
        process.exit(1);
    }
}

test();
