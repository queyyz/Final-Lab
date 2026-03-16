const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const app = express();
const PORT = process.env.PORT || 3003;
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.get('/', (req, res) => res.send('User Service running'));
app.listen(PORT, () => console.log(`User Service listening on port ${PORT}`));
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/users');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());
app.use('/users', userRoutes);

app.get('/', (req, res) => {
	res.send('User Service is running');
});

app.listen(PORT, () => {
	console.log(`User Service listening on port ${PORT}`);
});
