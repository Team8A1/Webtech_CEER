const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = await User.findOne({ email: 'shiv@kletech.ac.in' }).select('+password');
            if (user) {
                console.log('User: shiv');
                console.log('Password set:', !!user.password);
                const matchesDefault = await user.comparePassword('Student@123');
                console.log('Matches Student@123:', matchesDefault);
                console.log('Must Change Password:', user.mustChangePassword);
            } else {
                console.log('Shiv not found');
            }
        } catch (e) {
            console.error(e);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
