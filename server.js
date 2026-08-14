require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const errorHandler = require('./middleware/errorHandler');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('FixIt API is running');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
app.use('/api/requests', serviceRequestRoutes);

const offerRoutes = require('./routes/offerRoutes');
app.use('/api/offers', offerRoutes);

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/api/ratings', ratingRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});