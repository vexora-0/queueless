const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Service = require('./models/Service');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@queueless.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin@queueless.com / admin123');
    }

    const existingServices = await Service.countDocuments();
    if (existingServices === 0) {
      const admin = await User.findOne({ role: 'admin' });
      
      const services = [
        {
          name: 'Banking Service',
          description: 'Account opening, deposits, withdrawals',
          averageTimePerToken: 10,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Medical Consultation',
          description: 'General health checkup and consultation',
          averageTimePerToken: 15,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Government Office',
          description: 'Document verification and processing',
          averageTimePerToken: 20,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Customer Support',
          description: 'General inquiries and support',
          averageTimePerToken: 5,
          isActive: true,
          createdBy: admin._id
        }
      ];

      await Service.insertMany(services);
      console.log('Sample services created');
    } else {
      console.log('Services already exist');
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

