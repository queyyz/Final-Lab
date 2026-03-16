const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretkey';
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'No token provided' });
	jwt.verify(token, SECRET, (err, payload) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });
		req.user = payload;
		next();
	});
}
module.exports = authenticateToken;
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secretkey';

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'No token provided' });
	jwt.verify(token, SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });
		req.user = user;
		next();
	});
}

module.exports = authenticateToken;
