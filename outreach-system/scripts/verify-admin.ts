import dbConnect from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const EMAIL    = 'adekunlejoshua809@gmail.com';
const PASSWORD = '76639974Joshua';

const verify = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await dbConnect();
        console.log('✅ Connected.\n');

        const user = await User.findOne({ email: EMAIL }).lean() as any;

        if (!user) {
            console.log(`❌ No user found with email: ${EMAIL}`);
            console.log('👉 Run: npm run seed-admin  to create the admin account.');
            process.exit(1);
        }

        console.log('✅ User found in database:');
        console.log(`   Email         : ${user.email}`);
        console.log(`   Name          : ${user.name}`);
        console.log(`   Role          : ${user.role}`);
        console.log(`   AccountStatus : ${user.accountStatus}`);
        console.log(`   Has password  : ${!!user.password}`);
        console.log('');

        const passwordMatch = await bcrypt.compare(PASSWORD, user.password);
        console.log(`🔑 Password "${PASSWORD}" matches stored hash : ${passwordMatch ? '✅ YES' : '❌ NO'}`);

        if (!passwordMatch) {
            console.log('\n🔧 Password does NOT match — re-seeding now with correct hash...');
            const newHash = await bcrypt.hash(PASSWORD, 12);
            await User.findByIdAndUpdate(user._id, {
                password:      newHash,
                role:          'admin',
                accountStatus: 'active',
            });
            console.log('✅ Password updated successfully.');
            console.log(`\n🎉 You can now log in with:\n   Email   : ${EMAIL}\n   Password: ${PASSWORD}`);
        } else if (user.accountStatus !== 'active') {
            console.log(`\n⚠️  Account status is "${user.accountStatus}" — fixing to "active"...`);
            await User.findByIdAndUpdate(user._id, { accountStatus: 'active', role: 'admin' });
            console.log('✅ Account activated.');
        } else if (user.role !== 'admin') {
            console.log(`\n⚠️  Role is "${user.role}" — fixing to "admin"...`);
            await User.findByIdAndUpdate(user._id, { role: 'admin' });
            console.log('✅ Role updated to admin.');
        } else {
            console.log('\n🎉 Everything looks correct!');
            console.log(`   Try logging in with:\n   Email   : ${EMAIL}\n   Password: ${PASSWORD}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
};

verify();
