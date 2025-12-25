const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            console.log('Checking for shiv@kletech.ac.in...');
            const userShiv = await User.findOne({ email: 'shiv@kletech.ac.in' }).select('+password');
            if (userShiv) {
                console.log('User [shiv] found.');
                console.log('Has password:', !!userShiv.password);
                console.log('Role:', userShiv.role);
                const match = await userShiv.comparePassword('Student@123');
                console.log('Password matches "Student@123":', match);
            } else {
                console.log('User [shiv] not found.');
            }

            console.log('--------------------------------');

            console.log('Checking for shri@kletech.ac.in...');
            const userShri = await User.findOne({ email: 'shri@kletech.ac.in' }).select('+password');
            if (userShri) {
                console.log('User [shri] found.');
                console.log('Has password:', !!userShri.password);
                console.log('Role:', userShri.role);
                const match = await userShri.comparePassword('Student@123');
                console.log('Password matches "Student@123":', match);
            } else {
                console.log('User [shri] not found.');
            }

        } catch (e) {
            console.error(e);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
