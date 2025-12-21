const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars from CWD
dotenv.config();

const forceUpdateDivisions = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students.`);

        const divisions = ['A', 'B', 'C'];
        let updatedCount = 0;

        for (const student of students) {
            // Check if division is missing OR empty string
            if (!student.division || student.division.trim() === '') {
                const randomDiv = divisions[Math.floor(Math.random() * divisions.length)];
                student.division = randomDiv;
                await student.save();
                console.log(`FIXED: ${student.email} (${student.name}) -> Assigned Division ${randomDiv}`);
                updatedCount++;
            } else {
                console.log(`OK: ${student.email} already has Division ${student.division}`);
            }
        }

        console.log(`\nOperation Complete. Updated ${updatedCount} students who were missing divisions.`);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

forceUpdateDivisions();
