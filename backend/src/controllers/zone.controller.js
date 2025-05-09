const db = require('../models/db.model');
const { requireAdmin } = require('../middlewares/auth.middleware');

async function getAll(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const zones = await db.query(`
                SELECT 
                    z.id,
                    z.name,
                    z.price,
                    z.description,
                    z.theatre_id,
                    t.name as theatre_name
                FROM zones z
                JOIN theatres t ON z.theatre_id = t.id
                ORDER BY t.name, z.name
            `);
            res.json(zones);
        });
    } catch (err) {
        console.error(`Error while getting zones`, err.message);
        next(err);
    }
}

async function create(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { name, price, description, theatre_id } = req.body;
            
            if (!name || !price || !theatre_id) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            const result = await db.query(
                `INSERT INTO zones (name, price, description, theatre_id)
                 VALUES (?, ?, ?, ?)`,
                [name, price, description, theatre_id]
            );

            const newZone = await db.query(
                `SELECT 
                    z.id,
                    z.name,
                    z.price,
                    z.description,
                    z.theatre_id,
                    t.name as theatre_name
                 FROM zones z
                 JOIN theatres t ON z.theatre_id = t.id
                 WHERE z.id = ?`,
                [result.lastInsertRowid]
            );

            res.status(201).json(newZone[0]);
        });
    } catch (err) {
        console.error(`Error while creating zone`, err.message);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { id } = req.params;
            const { name, price, description, theatre_id } = req.body;

            if (!name || !price || !theatre_id) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            await db.query(
                `UPDATE zones 
                 SET name = ?, price = ?, description = ?, theatre_id = ?
                 WHERE id = ?`,
                [name, price, description, theatre_id, id]
            );

            const updatedZone = await db.query(
                `SELECT 
                    z.id,
                    z.name,
                    z.price,
                    z.description,
                    z.theatre_id,
                    t.name as theatre_name
                 FROM zones z
                 JOIN theatres t ON z.theatre_id = t.id
                 WHERE z.id = ?`,
                [id]
            );

            if (!updatedZone || updatedZone.length === 0) {
                res.status(404).json({ message: 'Zone not found' });
                return;
            }

            res.json(updatedZone[0]);
        });
    } catch (err) {
        console.error(`Error while updating zone`, err.message);
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        requireAdmin(req, res, async () => {
            const { id } = req.params;

            // Check if zone is being used by any seats
            const seatsUsingZone = await db.query(
                'SELECT id FROM seats WHERE zone_id = ?',
                [id]
            );

            if (seatsUsingZone && seatsUsingZone.length > 0) {
                res.status(400).json({ 
                    message: 'Cannot delete zone that is being used by seats' 
                });
                return;
            }

            const result = await db.query(
                'DELETE FROM zones WHERE id = ?',
                [id]
            );

            if (result.changes === 0) {
                res.status(404).json({ message: 'Zone not found' });
                return;
            }

            res.json({ message: 'Zone deleted successfully' });
        });
    } catch (err) {
        console.error(`Error while deleting zone`, err.message);
        next(err);
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove
}; 