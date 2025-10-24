const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3771;

// Database path - create in the same directory as server
const dbPath = path.join(__dirname, 'thyrosoft.db');
console.log(`🔍 Using database at: ${dbPath}`);

// CORS Configuration for React frontend
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3771', 'http://127.0.0.1:3771'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Enable pre-flight across-the-board
app.options('*', cors(corsOptions));

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Handle database errors
db.on('error', (err) => {
    console.error('❌ Database error:', err);
    if (err.code === 'SQLITE_CANTOPEN') {
        console.error('Cannot open database. The file may be locked or in use.');
    }
});

// Initialize database tables
function initializeDatabase() {
    // Enable WAL mode for better concurrency
    db.serialize(() => {
        db.run('PRAGMA journal_mode=WAL;', (err) => {
            if (err) console.error('❌ Error setting WAL mode:', err);
            else console.log('✅ Enabled WAL journal mode');
        });

        // Create patients table
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            patient_id TEXT NOT NULL UNIQUE,
            barcode_number TEXT,
            test_type TEXT NOT NULL,
            date TEXT NOT NULL,
            doctor_referred TEXT,
            branch TEXT,
            price REAL,
            contact_number TEXT,
            address TEXT,
            gender TEXT,
            age INTEGER,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        db.run(createTableSQL, (err) => {
            if (err) {
                console.error('❌ Error creating patients table:', err);
                process.exit(1);
            }
            console.log('✅ Database tables initialized');

            // Add some sample data if table is empty
            addSampleDataIfEmpty();
        });
    });
}

// Add sample data if database is empty
function addSampleDataIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM patients', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking patients count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No patients found, adding sample data...');
            const samplePatients = [
                {
                    name: 'John Doe',
                    patient_id: 'PAT001',
                    barcode_number: 'BC001',
                    test_type: 'Blood Test',
                    date: new Date().toISOString().split('T')[0],
                    doctor_referred: 'Dr. Smith',
                    branch: 'Main Branch',
                    price: 150.00,
                    contact_number: '9876543210',
                    address: '123 Main St, City, State',
                    gender: 'Male',
                    age: 35,
                    email: 'john.doe@example.com'
                },
                {
                    name: 'Jane Smith',
                    patient_id: 'PAT002',
                    barcode_number: 'BC002',
                    test_type: 'Thyroid Test',
                    date: new Date().toISOString().split('T')[0],
                    doctor_referred: 'Dr. Johnson',
                    branch: 'North Branch',
                    price: 200.00,
                    contact_number: '9123456789',
                    address: '456 Oak Ave, City, State',
                    gender: 'Female',
                    age: 28,
                    email: 'jane.smith@example.com'
                }
            ];

            let completed = 0;
            samplePatients.forEach(patient => {
                db.run(
                    `INSERT INTO patients (
                        name, patient_id, barcode_number, test_type, date,
                        doctor_referred, branch, price, contact_number,
                        address, gender, age, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        patient.name, patient.patient_id, patient.barcode_number,
                        patient.test_type, patient.date, patient.doctor_referred,
                        patient.branch, patient.price, patient.contact_number,
                        patient.address, patient.gender, patient.age, patient.email
                    ],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample patient:', err);
                        } else {
                            console.log(`✅ Added sample patient: ${patient.name} (ID: ${this.lastID})`);
                        }
                        completed++;
                        if (completed === samplePatients.length) {
                            console.log('✅ Sample data initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} patients`);
        }
    });
}

// Test endpoint
app.get('/api/test', (req, res) => {
    db.get('SELECT 1', (err) => {
        if (err) {
            console.error('❌ Database connection test failed:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Database connection failed',
                error: err.message
            });
        }

        db.get('SELECT COUNT(*) as count FROM patients', [], (err, row) => {
            if (err) {
                console.error('❌ Error counting patients:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Error checking patients table',
                    error: err.message
                });
            }

            res.json({
                status: 'success',
                message: `API and database are working! Found ${row.count} patients.`,
                timestamp: new Date().toISOString()
            });
        });
    });
});

// GET all patients
app.get('/api/patients', (req, res) => {
    console.log('🔍 GET /api/patients - Fetching patients...');

    // Check database file
    console.log(`📂 Database path: ${dbPath}`);
    console.log(`🔍 Database exists: ${fs.existsSync(dbPath) ? '✅ Yes' : '❌ No'}`);

    // Check if patients table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='patients';", [], (err, table) => {
        if (err) {
            console.error('❌ Error checking for patients table:', err);
            return res.status(500).json({ error: 'Database error checking for patients table' });
        }

        if (!table) {
            console.error('❌ Patients table does not exist');
            return res.json([]);
        }

        console.log('✅ Patients table exists, querying data...');

        // Get all patients
        db.all('SELECT * FROM patients ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching patients:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log(`✅ Found ${rows.length} patients`);
            if (rows.length > 0) {
                console.log('Sample patient data:', JSON.stringify(rows[0], null, 2));
            }

            res.json(rows);
        });
    });
});

// POST new patient
app.post('/api/patients', (req, res) => {
    console.log('📥 Received patient data:', JSON.stringify(req.body, null, 2));

    const {
        name,
        patient_id,
        barcode_number,
        test_type,
        date,
        doctor_referred,
        branch,
        price,
        contact_number,
        address,
        gender,
        age,
        email
    } = req.body;

    // Validate required fields
    const requiredFields = { name, patient_id, test_type, date };
    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields',
            missingFields,
            receivedData: req.body
        });
    }

    // Start a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Check if patient with this ID already exists
        db.get('SELECT * FROM patients WHERE patient_id = ?', [patient_id], (err, existingPatient) => {
            if (err) {
                db.run('ROLLBACK');
                console.error('❌ Database error checking for existing patient:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Database error checking for existing patient',
                    error: err.message
                });
            }

            if (existingPatient) {
                db.run('ROLLBACK');
                console.error('❌ Patient with this ID already exists');
                return res.status(409).json({
                    status: 'error',
                    message: 'A patient with this ID already exists',
                    existingPatient: existingPatient
                });
            }

            // Insert new patient
            const stmt = db.prepare(`
                INSERT INTO patients (
                    name, patient_id, barcode_number, test_type, date,
                    doctor_referred, branch, price, contact_number,
                    address, gender, age, email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(
                name,
                patient_id,
                barcode_number || null,
                test_type,
                date,
                doctor_referred || null,
                branch || null,
                price || null,
                contact_number || null,
                address || null,
                gender || null,
                age || null,
                email || null,
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        stmt.finalize();
                        console.error('❌ Error inserting patient:', err);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Failed to save patient',
                            error: err.message
                        });
                    }

                    const patientId = this.lastID;
                    stmt.finalize();

                    // Get the newly created patient
                    db.get('SELECT * FROM patients WHERE id = ?', [patientId], (err, newPatient) => {
                        if (err) {
                            db.run('ROLLBACK');
                            console.error('❌ Error fetching created patient:', err);
                            return res.status(500).json({
                                status: 'error',
                                message: 'Error fetching created patient',
                                error: err.message
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ Error committing transaction:', err);
                                return res.status(500).json({
                                    status: 'error',
                                    message: 'Failed to save patient',
                                    error: err.message
                                });
                            }

                            console.log('✅ Patient created successfully:', newPatient);
                            res.status(201).json({
                                status: 'success',
                                data: newPatient,
                                message: 'Patient created successfully'
                            });
                        });
                    });
                }
            );
        });
    });
});

// PUT update patient
app.put('/api/patients/:id', (req, res) => {
    const {
        name,
        patient_id,
        barcode_number,
        test_type,
        date,
        doctor_referred,
        branch,
        price,
        contact_number,
        address,
        gender,
        age,
        email
    } = req.body;

    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    db.run(
        `UPDATE patients SET
            name = COALESCE(?, name),
            patient_id = COALESCE(?, patient_id),
            barcode_number = COALESCE(?, barcode_number),
            test_type = COALESCE(?, test_type),
            date = COALESCE(?, date),
            doctor_referred = COALESCE(?, doctor_referred),
            branch = COALESCE(?, branch),
            price = COALESCE(?, price),
            contact_number = COALESCE(?, contact_number),
            address = COALESCE(?, address),
            gender = COALESCE(?, gender),
            age = COALESCE(?, age),
            email = COALESCE(?, email)
        WHERE id = ?`,
        [
            name, patient_id, barcode_number, test_type, date,
            doctor_referred, branch, price, contact_number,
            address, gender, age, email, id
        ],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(400).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            // Return the updated patient
            db.get('SELECT * FROM patients WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated patient:', err);
                    return res.status(500).json({ error: 'Error fetching updated patient' });
                }
                console.log('✅ Patient updated successfully:', row);
                res.json({
                    status: 'success',
                    data: row,
                    message: 'Patient updated successfully'
                });
            });
        }
    );
});

// DELETE patient
app.delete('/api/patients/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM patients WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        db.run('DELETE FROM patients WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ Patient deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'Patient deleted successfully',
                deletedPatient: row,
                changes: this.changes
            });
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            path: dbPath,
            exists: fs.existsSync(dbPath),
            size: fs.existsSync(dbPath) ? fs.statSync(dbPath).size + ' bytes' : 'N/A'
        }
    });
});

// Start the server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`🚀 Server accessible at http://127.0.0.1:${port}`);
    console.log(`💾 Database file: ${dbPath}`);
    console.log(`📊 API Base URL: http://localhost:${port}/api`);
    console.log('🔄 Server is running and waiting for connections...');
    console.log('\n📋 Available endpoints:');
    console.log('  GET  /api/test     - Test database connection');
    console.log('  GET  /api/health   - Server health check');
    console.log('  GET  /api/patients - Get all patients');
    console.log('  POST /api/patients - Create new patient');
    console.log('  PUT  /api/patients/:id - Update patient');
    console.log('  DELETE /api/patients/:id - Delete patient');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use.`);
        console.log('💡 Try stopping other servers or use a different port.');
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

console.log('🔄 Starting Thyrosoft backend server...');
console.log(`📅 Started at: ${new Date().toISOString()}`);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🔴 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        server.close(() => {
            console.log('Server shut down successfully');
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
