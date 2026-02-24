/**
 * Run this script ONCE to create your admin account.
 * Usage: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Your Admin Details — Edit These ──────────────────────────────────────────
const ADMIN = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@gmail.com',   // ← change this
    password: 'Admin1234!',        // ← change this (min 8 chars)
};
// ──────────────────────────────────────────────────────────────────────────────

async function createAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!\n');

        // Check if already exists
        const existing = await mongoose.connection.db
            .collection('users')
            .findOne({ email: ADMIN.email.toLowerCase() });

        if (existing) {
            console.log(`⚠️  A user with email "${ADMIN.email}" already exists.`);
            console.log(`   Role: ${existing.role}`);

            if (existing.role !== 'admin') {
                // Upgrade existing user to admin
                await mongoose.connection.db
                    .collection('users')
                    .updateOne({ email: ADMIN.email.toLowerCase() }, { $set: { role: 'admin' } });
                console.log('✅ Upgraded existing user to ADMIN role!');
            } else {
                console.log('✅ Already an admin. No changes made.');
            }
        } else {
            // Create fresh admin
            const hashedPassword = await bcrypt.hash(ADMIN.password, 12);
            await mongoose.connection.db.collection('users').insertOne({
                firstName: ADMIN.firstName,
                lastName: ADMIN.lastName,
                email: ADMIN.email.toLowerCase(),
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('🎉 Admin account created successfully!\n');
        }

        console.log('─────────────────────────────────');
        console.log('  Login at: http://localhost:5173/login');
        console.log(`  Email:    ${ADMIN.email}`);
        console.log(`  Password: ${ADMIN.password}`);
        console.log('─────────────────────────────────\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
