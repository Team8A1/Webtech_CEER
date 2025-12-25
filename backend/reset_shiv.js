const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const user = await User.findOne({ email: 'shiv@kletech.ac.in' });
            if (user) {
                user.password = 'Student@123';
                // Ensure mustChangePassword is TRUE so they see the modal
                user.mustChangePassword = true;
                await user.save();
                console.log('RESET_SUCCESS: Password reset to Student@123 for shiv');
            } else {
                console.log('RESET_FAIL: Shiv not found');
            }
        } catch (e) {
            console.error(e);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
