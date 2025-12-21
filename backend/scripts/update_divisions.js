const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars from CWD
dotenv.config();

const updateDivisions = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students.`);

        const divisions = ['A', 'B', 'C'];
        let count = 0;

        for (const student of students) {
            // Update ALL students to ensure they have a division, even if they already had one (optional, but good for testing)
            // or just update missing ones. Let's update missing ones.
            if (!student.division) {
                const randomDiv = divisions[Math.floor(Math.random() * divisions.length)];
                student.division = randomDiv;
                await student.save();
                console.log(`Updated ${student.email} with Division ${randomDiv}`);
                count++;
            }
        }

        console.log(`Updated ${count} students.`);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateDivisions();
