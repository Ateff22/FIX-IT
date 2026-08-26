require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const errorHandler = require('./middleware/errorHandler');

const mongoose = require('mongoose');
let cachedConnection = null;
async function connectDB() {
  if (cachedConnection) return cachedConnection;
  cachedConnection = mongoose.connect(process.env.MONGO_URI)
    .then((conn) => { console.log('MongoDB connected'); return conn; })
    .catch((err) => { console.log(err); cachedConnection = null; throw err; });
  return cachedConnection;
}
connectDB();

  const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('frontend/dist'));
app.use('/uploads', express.static('uploads'));
// بديل ال cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
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

app.get(/^\/(?!api|uploads|api-docs).*/, (req, res) => {
  res.sendFile(require('path').join(__dirname, 'frontend/dist/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;