import dbConnect from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        await dbConnect();

        const email = 'adekunlejoshua809@gmail.com';
        const password = '76639974Joshua';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.accountStatus = 'active';
            await existingAdmin.save();
            console.log('Admin account updated with new password');
            process.exit(0);
        }

        const admin = new User({
            name: 'Super Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            accountStatus: 'active',
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log(`Credentials: ${email} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAdmin();
