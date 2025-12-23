const express = require('express');
const Service = require('../models/Service');
const Token = require('../models/Token');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(adminAuth);

router.post('/services', async (req, res) => {
  try {
    const { name, description, averageTimePerToken } = req.body;

    const service = new Service({
      name,
      description,
      averageTimePerToken: averageTimePerToken || 5,
      createdBy: req.user._id
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const { name, description, averageTimePerToken, isActive } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, averageTimePerToken, isActive },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tokens/:serviceId', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { service: req.params.serviceId };
    if (status) query.status = status;

    const tokens = await Token.find(query)
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tokens/:tokenId/call', async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId)
      .populate('service', 'name')
      .populate('user', 'name email');

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status === 'completed' || token.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot call this token' });
    }

    token.status = 'called';
    token.calledAt = new Date();
    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tokens/service/:serviceId/call-next', async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const nextToken = await Token.findOne({
      service: serviceId,
      status: 'pending'
    })
    .sort({ tokenNumber: 1 })
    .populate('service', 'name')
    .populate('user', 'name email');

    if (!nextToken) {
      return res.status(404).json({ message: 'No pending tokens found' });
    }

    nextToken.status = 'called';
    nextToken.calledAt = new Date();
    await nextToken.save();

    res.json(nextToken);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tokens/:tokenId/complete', async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    token.status = 'completed';
    token.completedAt = new Date();
    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tokens/:tokenId/skip', async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findById(tokenId);

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status !== 'called') {
      return res.status(400).json({ message: 'Can only skip called tokens' });
    }

    token.status = 'skipped';
    await token.save();

    const nextToken = await Token.findOne({
      service: token.service,
      status: 'pending'
    }).sort({ tokenNumber: 1 });

    if (nextToken) {
      nextToken.status = 'called';
      nextToken.calledAt = new Date();
      await nextToken.save();
    }

    res.json({ message: 'Token skipped', nextToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    const serviceIds = services.map(s => s._id);

    const tokenStats = await Token.aggregate([
      {
        $match: {
          service: { $in: serviceIds }
        }
      },
      {
        $group: {
          _id: {
            service: '$service',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    tokenStats.forEach(stat => {
      const serviceId = stat._id.service.toString();
      const status = stat._id.status;
      if (!statsMap[serviceId]) {
        statsMap[serviceId] = { pending: 0, called: 0, completed: 0 };
      }
      if (status === 'pending' || status === 'called' || status === 'completed') {
        statsMap[serviceId][status] = stat.count;
      }
    });

    const stats = services.map(service => {
      const serviceId = service._id.toString();
      return {
        serviceId: serviceId,
        serviceName: service.name,
        pending: statsMap[serviceId]?.pending || 0,
        called: statsMap[serviceId]?.called || 0,
        completed: statsMap[serviceId]?.completed || 0
      };
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

