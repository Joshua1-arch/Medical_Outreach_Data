import dbConnect from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        await dbConnect();

        const email = 'admin@example.com';
        const password = 'securepassword';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists');
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
