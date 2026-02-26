
import dbConnect from './lib/db';
import User from './models/User';
import { sendEmail } from './lib/email';
import crypto from 'crypto';

async function testFlow() {
    try {
        await dbConnect();
        const email = 'adekunlejoshua809@gmail.com';
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found. Cannot test password reset flow.');
            process.exit(1);
        }

        console.log('User found. Triggering password reset email test...');
        
        const token = crypto.randomBytes(32).toString('hex');
        const resetUrl = `http://localhost:3000/reset-password/${token}`;
        
        const html = `<h1>Test Reset</h1><p>Reset link: ${resetUrl}</p>`;
        
        const result = await sendEmail({
            to: email,
            subject: 'ReachPoint REAL FLOW TEST',
            html,
            text: `Reset your password here: ${resetUrl}`
        });

        console.log('Flow test result:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Flow test error:', error);
        process.exit(1);
    }
}

testFlow();
