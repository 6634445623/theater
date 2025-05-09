const db = require('../models/db.model');
const { requireAdmin } = require('../middlewares/auth.middleware');

async function getAll(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const theatres = await db.query(`
                SELECT id, name
                FROM theatres
                ORDER BY name
            `);
            res.json(theatres);
        });
    } catch (err) {
        console.error(`Error while getting theatres`, err.message);
        next(err);
    }
}

async function create(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { name } = req.body;
            
            if (!name) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const result = await db.query(
                `INSERT INTO theatres (name)
                 VALUES (?)`,
                [name]
            );

            const newTheatre = await db.query(
                `SELECT id, name
                 FROM theatres
                 WHERE id = ?`,
                [result.lastInsertRowid]
            );

            res.status(201).json(newTheatre[0]);
        });
    } catch (err) {
        console.error(`Error while creating theatre`, err.message);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            await db.query(
                `UPDATE theatres 
                 SET name = ?
                 WHERE id = ?`,
                [name, id]
            );

            const updatedTheatre = await db.query(
                `SELECT id, name
                 FROM theatres
                 WHERE id = ?`,
                [id]
            );

            if (!updatedTheatre || updatedTheatre.length === 0) {
                res.status(404).json({ message: 'Theatre not found' });
                return;
            }

            res.json(updatedTheatre[0]);
        });
    } catch (err) {
        console.error(`Error while updating theatre`, err.message);
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { id } = req.params;

            // Check if theatre is being used by any zones
            const zonesUsingTheatre = await db.query(
                'SELECT id FROM zones WHERE theatre_id = ?',
                [id]
            );

            if (zonesUsingTheatre && zonesUsingTheatre.length > 0) {
                res.status(400).json({ 
                    message: 'Cannot delete theatre that has zones. Please delete all zones first.' 
                });
                return;
            }

            // Check if theatre is being used by any seats
            const seatsUsingTheatre = await db.query(
                'SELECT id FROM seats WHERE theatre_id = ?',
                [id]
            );

            if (seatsUsingTheatre && seatsUsingTheatre.length > 0) {
                res.status(400).json({ 
                    message: 'Cannot delete theatre that has seats. Please delete all seats first.' 
                });
                return;
            }

            // Check if theatre has any schedules
            const scheduleResult = await db.query(
                'SELECT id FROM schedules WHERE theatre_id = ?',
                [id]
            );

            if (scheduleResult && scheduleResult.length > 0) {
                res.status(400).json({ 
                    message: 'Cannot delete theatre that has schedules. Please delete all schedules first.' 
                });
                return;
            }

            const result = await db.query(
                'DELETE FROM theatres WHERE id = ?',
                [id]
            );

            if (result.changes === 0) {
                res.status(404).json({ message: 'Theatre not found' });
                return;
            }

            res.json({ message: 'Theatre deleted successfully' });
        });
    } catch (err) {
        console.error(`Error while deleting theatre`, err.message);
        next(err);
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove
}; 