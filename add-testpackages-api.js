const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
console.log('🔧 Adding Test Packages API endpoints to server.js...');

// Read the server.js file
let content = fs.readFileSync(serverPath, 'utf8');

// Add testpackages API endpoints after the tests endpoints
content = content.replace(
    'console.log(\'  DELETE /api/users/:id - Delete user\');',
    `console.log('  DELETE /api/users/:id - Delete user');
    console.log('  GET  /api/tests - Get all tests');
    console.log('  POST /api/tests - Create new test');
    console.log('  PUT  /api/tests/:id - Update test');
    console.log('  DELETE /api/tests/:id - Delete test');
    console.log('  GET  /api/testpackages - Get all test packages');
    console.log('  POST /api/testpackages - Create new test package');
    console.log('  PUT  /api/testpackages/:id - Update test package');
    console.log('  DELETE /api/testpackages/:id - Delete test package');

// ==================== TESTS API ENDPOINTS ====================

// GET all tests
app.get('/api/tests', (req, res) => {
    console.log('🔍 GET /api/tests - Fetching tests...');

    db.all('SELECT * FROM tests ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching tests:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log('✅ Found ' + rows.length + ' tests');
        res.json(rows);
    });
});

// POST new test
app.post('/api/tests', (req, res) => {
    const { testname, cost_b2c, cost_b2b } = req.body;
    console.log('📥 Received test data:', { testname, cost_b2c, cost_b2b });

    // Validate required fields
    if (!testname || !cost_b2c || !cost_b2b) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['testname', 'cost_b2c', 'cost_b2b']
        });
    }

    // Check if test already exists
    db.get('SELECT id FROM tests WHERE testname = ?', [testname], (err, row) => {
        if (err) {
            console.error('❌ Error checking test:', err);
            return res.status(500).json({ error: 'Error checking test' });
        }

        if (row) {
            return res.status(400).json({ error: 'Test name already exists' });
        }

        // Insert new test
        db.run(
            'INSERT INTO tests (testname, cost_b2c, cost_b2b) VALUES (?, ?, ?)',
            [testname, cost_b2c, cost_b2b],
            function(err) {
                if (err) {
                    console.error('❌ Error creating test:', err);
                    return res.status(400).json({ error: err.message });
                }

                const testId = this.lastID;
                db.get('SELECT * FROM tests WHERE id = ?', [testId], (err, row) => {
                    if (err) {
                        console.error('Error fetching created test:', err);
                        return res.status(500).json({ error: 'Error fetching created test' });
                    }
                    console.log('✅ Test created successfully:', row);
                    res.status(201).json({
                        status: 'success',
                        data: row,
                        message: 'Test created successfully'
                    });
                });
            }
        );
    });
});

// PUT update test
app.put('/api/tests/:id', (req, res) => {
    const id = req.params.id;
    const { testname, cost_b2c, cost_b2b } = req.body;

    // Build update query dynamically based on provided fields
    let updates = [];
    let values = [];

    if (testname !== undefined) {
        updates.push('testname = ?');
        values.push(testname);
    }
    if (cost_b2c !== undefined) {
        updates.push('cost_b2c = ?');
        values.push(cost_b2c);
    }
    if (cost_b2b !== undefined) {
        updates.push('cost_b2b = ?');
        values.push(cost_b2b);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = 'UPDATE tests SET ' + updates.join(', ') + ' WHERE id = ?';

    db.run(sql, values, function(err) {
        if (err) {
            console.error('❌ Error updating test:', err);
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Test not found' });
        }

        db.get('SELECT * FROM tests WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated test:', err);
                return res.status(500).json({ error: 'Error fetching updated test' });
            }
            console.log('✅ Test updated successfully:', row);
            res.json({
                status: 'success',
                data: row,
                message: 'Test updated successfully'
            });
        });
    });
});

// DELETE test
app.delete('/api/tests/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM tests WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Test not found' });
        }

        db.run('DELETE FROM tests WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ Test deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'Test deleted successfully',
                deletedTest: row,
                changes: this.changes
            });
        });
    });
});

// ==================== TEST PACKAGES API ENDPOINTS ====================

// GET all test packages
app.get('/api/testpackages', (req, res) => {
    console.log('🔍 GET /api/testpackages - Fetching test packages...');

    db.all('SELECT * FROM testpackages ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching test packages:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log('✅ Found ' + rows.length + ' test packages');
        res.json(rows);
    });
});

// POST new test package
app.post('/api/testpackages', (req, res) => {
    const { testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b } = req.body;
    console.log('📥 Received test package data:', { testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b });

    // Validate required fields
    if (!testpackage_name || !no_of_tests || !list_of_tests || !cost_b2c || !cost_b2b) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['testpackage_name', 'no_of_tests', 'list_of_tests', 'cost_b2c', 'cost_b2b']
        });
    }

    // Check if test package already exists
    db.get('SELECT id FROM testpackages WHERE testpackage_name = ?', [testpackage_name], (err, row) => {
        if (err) {
            console.error('❌ Error checking test package:', err);
            return res.status(500).json({ error: 'Error checking test package' });
        }

        if (row) {
            return res.status(400).json({ error: 'Test package name already exists' });
        }

        // Insert new test package
        db.run(
            'INSERT INTO testpackages (testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b) VALUES (?, ?, ?, ?, ?)',
            [testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b],
            function(err) {
                if (err) {
                    console.error('❌ Error creating test package:', err);
                    return res.status(400).json({ error: err.message });
                }

                const packageId = this.lastID;
                db.get('SELECT * FROM testpackages WHERE id = ?', [packageId], (err, row) => {
                    if (err) {
                        console.error('Error fetching created test package:', err);
                        return res.status(500).json({ error: 'Error fetching created test package' });
                    }
                    console.log('✅ Test package created successfully:', row);
                    res.status(201).json({
                        status: 'success',
                        data: row,
                        message: 'Test package created successfully'
                    });
                });
            }
        );
    });
});

// PUT update test package
app.put('/api/testpackages/:id', (req, res) => {
    const id = req.params.id;
    const { testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b } = req.body;

    // Build update query dynamically based on provided fields
    let updates = [];
    let values = [];

    if (testpackage_name !== undefined) {
        updates.push('testpackage_name = ?');
        values.push(testpackage_name);
    }
    if (no_of_tests !== undefined) {
        updates.push('no_of_tests = ?');
        values.push(no_of_tests);
    }
    if (list_of_tests !== undefined) {
        updates.push('list_of_tests = ?');
        values.push(list_of_tests);
    }
    if (cost_b2c !== undefined) {
        updates.push('cost_b2c = ?');
        values.push(cost_b2c);
    }
    if (cost_b2b !== undefined) {
        updates.push('cost_b2b = ?');
        values.push(cost_b2b);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = 'UPDATE testpackages SET ' + updates.join(', ') + ' WHERE id = ?';

    db.run(sql, values, function(err) {
        if (err) {
            console.error('❌ Error updating test package:', err);
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Test package not found' });
        }

        db.get('SELECT * FROM testpackages WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated test package:', err);
                return res.status(500).json({ error: 'Error fetching updated test package' });
            }
            console.log('✅ Test package updated successfully:', row);
            res.json({
                status: 'success',
                data: row,
                message: 'Test package updated successfully'
            });
        });
    });
});

// DELETE test package
app.delete('/api/testpackages/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM testpackages WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Test package not found' });
        }

        db.run('DELETE FROM testpackages WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ Test package deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'Test package deleted successfully',
                deletedTestPackage: row,
                changes: this.changes
            });
        });
    });
});`);

// Write the updated file
fs.writeFileSync(serverPath, content);
console.log('✅ Added Test Packages API endpoints to server.js!');
console.log('✅ Added complete CRUD operations for testpackages');
console.log('🔄 Please restart the backend server to activate the new endpoints...');
