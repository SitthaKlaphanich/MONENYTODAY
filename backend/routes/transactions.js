const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    const { month } = req.query;
    const [rows] = await db.query(
        `SELECT t.*, c.name AS category_name
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = ? AND DATE_FORMAT(t.trans_date,'%Y-%m') = ?
         ORDER BY t.trans_date DESC`
    );
    res.json(rows);
});

router.post('/', async (req, res) => {
    const { type, amount, category_id, note, trans_date } = req.body;
    if (!['income','expense'].includes(type) || !(amount > 0)) 
        return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
    
    const [r] = await db.query(
        `INSERT INTO transactions (user_id, type, amount, category_id, note, trans_date )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, type, amount, category_id, note, trans_date]
    );
    res.status(201).json({ id: r.insertId, ...req.body });
});

module.exports = router;