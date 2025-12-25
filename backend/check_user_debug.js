const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = await User.findOne({ email: 'shri@kletech.ac.in' }).select('+password');
            if (user) {
                console.log('User found:', user.email);
                console.log('Has password:', !!user.password);
                console.log('Role:', user.role);
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
