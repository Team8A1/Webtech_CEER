const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const shiv = await User.countDocuments({ email: 'shiv@kletech.ac.in' });
            const shri = await User.countDocuments({ email: 'shri@kletech.ac.in' });

            console.log('JSON_RESULT:' + JSON.stringify({ shivExists: shiv > 0, shriExists: shri > 0 }));
        } catch (e) {
            console.error(e);
        } finally {
            await mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
