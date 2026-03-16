const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const authenticateToken = require('../middleware/authMiddleware');

// Health check
router.get('/health', (req, res) => {
	res.json({ status: 'ok', service: 'user-service' });
});

// GET /api/users/me — ดู profile ของตนเอง (สร้างอัตโนมัติถ้ายังไม่มี)
router.get('/me', authenticateToken, async (req, res) => {
	const { sub, username, email, role } = req.user;
	try {
		let result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [sub]);
		if (result.rows.length === 0) {
			// สร้าง profile เริ่มต้น
			await pool.query(
				'INSERT INTO user_profiles (user_id, username, email, role, display_name) VALUES ($1, $2, $3, $4, $5)',
				[sub, username, email, role, username]
			);
			result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [sub]);
		}
		res.json({ profile: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// PUT /api/users/me — แก้ไข profile ของตนเอง
router.put('/me', authenticateToken, async (req, res) => {
	const { sub } = req.user;
	const { display_name, bio, avatar_url } = req.body;
	try {
		await pool.query(
			'UPDATE user_profiles SET display_name = $1, bio = $2, avatar_url = $3, updated_at = NOW() WHERE user_id = $4',
			[display_name, bio, avatar_url, sub]
		);
		const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [sub]);
		res.json({ profile: result.rows[0] });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// GET /api/users — ดูรายชื่อผู้ใช้ทั้งหมด (Admin only)
router.get('/', authenticateToken, async (req, res) => {
	if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
	try {
		const result = await pool.query('SELECT * FROM user_profiles');
		res.json({ users: result.rows });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { generateToken } = require('../middleware/jwtUtils');
const authenticateToken = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
	const { username, password } = req.body;
	try {
		const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, password]);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Login
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
		if (result.rows.length === 0) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = generateToken({ id: result.rows[0].id, username });
		res.json({ token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Profile (protected)
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.user.id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(result.rows[0]);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
