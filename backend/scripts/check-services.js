const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../models/Service');

const checkServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const allServices = await Service.find({});
    console.log(`Total services: ${allServices.length}`);
    
    const activeServices = await Service.find({ isActive: true });
    console.log(`Active services: ${activeServices.length}`);

    if (allServices.length > 0) {
      console.log('\nAll Services:');
      allServices.forEach((service, index) => {
        console.log(`${index + 1}. ${service.name} - Active: ${service.isActive}`);
      });
    } else {
      console.log('No services found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkServices();

