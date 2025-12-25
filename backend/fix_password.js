const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = await User.findOne({ email: 'shri@kletech.ac.in' });
            if (user) {
                user.password = 'Student@123';
                await user.save();
                console.log('Password updated for shri@kletech.ac.in');
            } else {
                console.log('User not found');
            }
        } catch (e) {
            console.error(e);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
