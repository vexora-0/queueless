const express = require('express');
const Token = require('../models/Token');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

const router = express.Router();

const calculateEstimatedWaitTime = async (serviceId, tokenNumber) => {
  const service = await Service.findById(serviceId);
  const pendingTokens = await Token.countDocuments({
    service: serviceId,
    status: 'pending',
    tokenNumber: { $lt: tokenNumber }
  });
  return pendingTokens * (service.averageTimePerToken || 5);
};

router.post('/book', auth, async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    if (!service.isActive) {
      return res.status(400).json({ message: 'Service is currently inactive' });
    }

    const existingToken = await Token.findOne({
      user: req.user._id,
      service: serviceId,
      status: { $in: ['pending', 'called'] }
    });

    if (existingToken) {
      return res.status(400).json({ message: 'You already have an active token for this service' });
    }

    const lastToken = await Token.findOne({ 
      service: serviceId
    })
      .sort({ tokenNumber: -1 })
      .lean();

    let tokenNumber = 1;
    if (lastToken && typeof lastToken.tokenNumber === 'number') {
      tokenNumber = lastToken.tokenNumber + 1;
    }
    
    const estimatedWaitTime = await calculateEstimatedWaitTime(serviceId, tokenNumber);

    const token = new Token({
      tokenNumber,
      service: serviceId,
      user: req.user._id,
      estimatedWaitTime
    });

    await token.save();
    await token.populate('service', 'name description');

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-tokens', auth, async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user._id })
      .populate('service', 'name description')
      .sort({ createdAt: -1 });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-tokens/:serviceId', auth, async (req, res) => {
  try {
    const token = await Token.findOne({
      user: req.user._id,
      service: req.params.serviceId,
      status: { $in: ['pending', 'called'] }
    }).populate('service', 'name description');

    if (!token) {
      return res.status(404).json({ message: 'No active token found' });
    }

    const currentToken = await Token.findOne({
      service: req.params.serviceId,
      status: 'called'
    }).sort({ calledAt: -1 });

    const pendingBeforeMe = await Token.countDocuments({
      service: req.params.serviceId,
      status: 'pending',
      tokenNumber: { $lt: token.tokenNumber }
    });

    const service = await Service.findById(req.params.serviceId);
    const updatedWaitTime = pendingBeforeMe * (service.averageTimePerToken || 5);

    token.estimatedWaitTime = updatedWaitTime;
    await token.save();

    res.json({
      ...token.toObject(),
      currentTokenNumber: currentToken ? currentToken.tokenNumber : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/cancel/:tokenId', auth, async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findOne({
      _id: tokenId,
      user: req.user._id
    });

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed token' });
    }

    token.status = 'cancelled';
    await token.save();

    res.json({ message: 'Token cancelled successfully', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

