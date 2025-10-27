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
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://jimjam-457.github.io'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Enable CORS for all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get('/api/sales/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT s.*, bc.institution_name, d.name AS doctor_name,
               p.age AS patient_age, p.gender AS patient_gender
        FROM sales s
        LEFT JOIN b2b_clients bc ON bc.id = s.b2b_client_id
        LEFT JOIN doctors d ON d.id = s.ref_by_doctor_id
        LEFT JOIN patients p ON p.id = s.patient_id
        WHERE s.id = ?
    `;
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('❌ Error fetching sale:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ error: 'Sale not found' });
        const data = { ...row, items: row.items ? JSON.parse(row.items) : [] };
        res.json(data);
    });
});

app.get('/api/stats/summary', (req, res) => {
  const period = String(req.query.period || 'day').toLowerCase();
  const dateParam = req.query.date ? String(req.query.date) : new Date().toISOString().split('T')[0];
  const base = new Date(dateParam + 'T00:00:00');
  if (isNaN(base.getTime())) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  let start = new Date(base);
  let end = new Date(base);

  if (period === 'day') {
  } else if (period === 'week') {
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    start.setDate(start.getDate() + diffToMonday);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (period === 'month') {
    start.setDate(1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  } else {
    return res.status(400).json({ error: "Invalid period. Use 'day', 'week', or 'month'" });
  }
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startStr = fmt(start);
  const endStr = fmt(end);

  const sql = `
    SELECT
      COUNT(*) AS sales_count,
      IFNULL(SUM(COALESCE(CAST(total AS REAL),0)), 0) AS amount_total,
      IFNULL(SUM(COALESCE(CAST(balance_due AS REAL),0)), 0) AS amount_balance,
      IFNULL(SUM(COALESCE(CAST(advance AS REAL),0)), 0) AS amount_credited,
      SUM(CASE WHEN ref_by_doctor_id IS NOT NULL AND ref_by_doctor_id <> '' THEN 1 ELSE 0 END) AS doctor_referrals_count,
      SUM(CASE WHEN client_type = 'B2B' THEN 1 ELSE 0 END) AS b2b_sales_count,
      SUM(CASE WHEN client_type = 'B2C' THEN 1 ELSE 0 END) AS b2c_sales_count,
      COUNT(DISTINCT CASE WHEN client_type = 'B2B' THEN b2b_client_id END) AS b2b_clients_count_distinct
    FROM sales
    WHERE date BETWEEN ? AND ?
  `;

  db.get(sql, [startStr, endStr], (err, row) => {
    if (err) {
      console.error('❌ Error computing stats summary:', err);
      return res.status(500).json({ error: 'Error computing stats' });
    }
    res.json({
      period,
      range: { start: startStr, end: endStr },
      ...row,
    });
  });
});

// PUT update sale
app.put('/api/sales/:id', (req, res) => {
    const id = req.params.id;
    const {
        date,
        branch_id,
        b2b_client_id,
        ref_by_doctor_id,
        patient_id,
        patient_name,
        tests: items,
        discount_mode,
        discount_value,
        advance,
        total,
        balance_due,
        payment_method,
        status,
        client_type
    } = req.body;

    const sql = `UPDATE sales SET
        date = COALESCE(?, date),
        client_type = COALESCE(?, client_type),
        branch_id = COALESCE(?, branch_id),
        b2b_client_id = COALESCE(?, b2b_client_id),
        ref_by_doctor_id = COALESCE(?, ref_by_doctor_id),
        patient_id = COALESCE(?, patient_id),
        patient_name = COALESCE(?, patient_name),
        items = COALESCE(?, items),
        discount_mode = COALESCE(?, discount_mode),
        discount_value = COALESCE(?, discount_value),
        advance = COALESCE(?, advance),
        total = COALESCE(?, total),
        balance_due = COALESCE(?, balance_due),
        payment_method = COALESCE(?, payment_method),
        status = COALESCE(?, status)
      WHERE id = ?`;

    const values = [
      date || null,
      client_type || null,
      branch_id || null,
      b2b_client_id || null,
      ref_by_doctor_id || null,
      patient_id || null,
      patient_name || null,
      items ? JSON.stringify(items) : null,
      discount_mode || null,
      discount_value ?? null,
      advance ?? null,
      total ?? null,
      balance_due ?? null,
      payment_method || null,
      status || null,
      id
    ];

    db.run(sql, values, function(err) {
      if (err) {
        console.error('❌ Error updating sale:', err);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }
      db.get('SELECT * FROM sales WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('❌ Error fetching updated sale:', err);
          return res.status(500).json({ error: 'Error fetching updated sale' });
        }
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
      });
    });
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
            console.log('✅ Patients table created successfully');

            // Create branches table
            const createBranchesTableSQL = `
            CREATE TABLE IF NOT EXISTS branches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                branch_code TEXT NOT NULL UNIQUE,
                branch_name TEXT NOT NULL,
                phone_number TEXT,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;

            db.run(createBranchesTableSQL, (err) => {
                if (err) {
                    console.error('❌ Error creating branches table:', err);
                    process.exit(1);
                }
                console.log('✅ Branches table created successfully');

                // Create doctors table
                const createDoctorsTableSQL = `
                CREATE TABLE IF NOT EXISTS doctors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    specialization TEXT NOT NULL,
                    clinicName TEXT NOT NULL,
                    phone_number TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;

                db.run(createDoctorsTableSQL, (err) => {
                    if (err) {
                        console.error('❌ Error creating doctors table:', err);
                        process.exit(1);
                    }
                    console.log('✅ Doctors table created successfully');

                    // Create tests, testpackages, users, and b2b_clients tables (separately to avoid multi-statement issues)
                    const createTestsTableSQL = `
                        CREATE TABLE IF NOT EXISTS tests (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            testname TEXT NOT NULL UNIQUE,
                            cost_b2c DECIMAL(10,2) NOT NULL,
                            cost_b2b DECIMAL(10,2) NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`;

                    const createTestPackagesTableSQL = `
                        CREATE TABLE IF NOT EXISTS testpackages (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            testpackage_name TEXT NOT NULL UNIQUE,
                            no_of_tests INTEGER NOT NULL,
                            list_of_tests TEXT NOT NULL,
                            cost_b2c DECIMAL(10,2) NOT NULL,
                            cost_b2b DECIMAL(10,2) NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`;

                    const createUsersTableSQL = `
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            phone_number TEXT NOT NULL,
                            email TEXT NOT NULL UNIQUE,
                            password TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`;

                    const createB2BClientsTableSQL = `
                        CREATE TABLE IF NOT EXISTS b2b_clients (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            institution_name TEXT NOT NULL UNIQUE,
                            phone_number TEXT,
                            address TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`;

                    db.run(createTestsTableSQL, (err) => {
                        if (err) {
                            console.error('❌ Error creating tests table:', err);
                            process.exit(1);
                        }
                        console.log('✅ Tests table created successfully');

                        db.run(createTestPackagesTableSQL, (err) => {
                            if (err) {
                                console.error('❌ Error creating testpackages table:', err);
                                process.exit(1);
                            }
                            console.log('✅ Testpackages table created successfully');

                            db.run(createUsersTableSQL, (err) => {
                                if (err) {
                                    console.error('❌ Error creating users table:', err);
                                    process.exit(1);
                                }
                                console.log('✅ Users table created successfully');

                                db.run(createB2BClientsTableSQL, (err) => {
                                    if (err) {
                                        console.error('❌ Error creating b2b_clients table:', err);
                                        process.exit(1);
                                    }
                                    console.log('✅ B2B Clients table created successfully');

                                    // Create sales table
                                    const createSalesTableSQL = `
                                        CREATE TABLE IF NOT EXISTS sales (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            invoice_no TEXT UNIQUE,
                                            client_type TEXT NOT NULL,
                                            branch_id INTEGER,
                                            b2b_client_id INTEGER,
                                            ref_by_doctor_id INTEGER,
                                            patient_id INTEGER,
                                            patient_name TEXT,
                                            items TEXT,
                                            discount_mode TEXT,
                                            discount_value REAL,
                                            advance REAL,
                                            total REAL,
                                            balance_due REAL,
                                            payment_method TEXT,
                                            status TEXT,
                                            date TEXT,
                                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                        )`;

                                    db.run(createSalesTableSQL, (err) => {
                                        if (err) {
                                            console.error('❌ Error creating sales table:', err);
                                            process.exit(1);
                                        }
                                        console.log('✅ Sales table created successfully');
                                        console.log('✅ Database tables initialized');

                                        // Add some sample data if tables are empty
                                        addSampleDataIfEmpty();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// Add sample data if database is empty
function addSampleDataIfEmpty() {
    // Check and add sample patients
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
                            console.log('✅ Sample patients initialization complete');
                            addSampleBranchesIfEmpty();
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} patients`);
            addSampleBranchesIfEmpty();
        }
    });

    // Also check and add sample doctors
    db.get('SELECT COUNT(*) as count FROM doctors', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking doctors count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No doctors found, adding sample data...');
            const sampleDoctors = [
                {
                    name: 'Dr. Sarah Johnson',
                    specialization: 'Cardiology',
                    clinicName: 'City Heart Center',
                    phone_number: '9876543210'
                },
                {
                    name: 'Dr. Michael Chen',
                    specialization: 'Neurology',
                    clinicName: 'Brain & Spine Institute',
                    phone_number: '9123456789'
                },
                {
                    name: 'Dr. Emily Davis',
                    specialization: 'Dermatology',
                    clinicName: 'Skin Care Clinic',
                    phone_number: '9876543211'
                },
                {
                    name: 'Dr. Robert Wilson',
                    specialization: 'Orthopedics',
                    clinicName: 'Joint & Bone Center',
                    phone_number: '9123456790'
                },
                {
                    name: 'Dr. Lisa Anderson',
                    specialization: 'Gynecology',
                    clinicName: 'Women\'s Health Center',
                    phone_number: '9876543212'
                }
            ];

            let completed = 0;
            sampleDoctors.forEach(doctor => {
                db.run(
                    `INSERT INTO doctors (name, specialization, clinicName, phone_number) VALUES (?, ?, ?, ?)`,
                    [doctor.name, doctor.specialization, doctor.clinicName, doctor.phone_number],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample doctor:', err);
                        } else {
                            console.log(`✅ Added sample doctor: ${doctor.name} (ID: ${this.lastID})`);
                        }
                        completed++;
                        if (completed === sampleDoctors.length) {
                            console.log('✅ Sample doctors initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} doctors`);
            addSampleUsersIfEmpty();
        }
    });
}

// Add sample doctors if empty
function addSampleDoctorsIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM doctors', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking doctors count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No doctors found, adding sample data...');
            const sampleDoctors = [
                {
                    name: 'Dr. Sarah Johnson',
                    specialization: 'Cardiology',
                    clinicName: 'City Heart Center',
                    phone_number: '9876543210'
                },
                {
                    name: 'Dr. Michael Chen',
                    specialization: 'Neurology',
                    clinicName: 'Brain & Spine Institute',
                    phone_number: '9123456789'
                },
                {
                    name: 'Dr. Emily Davis',
                    specialization: 'Dermatology',
                    clinicName: 'Skin Care Clinic',
                    phone_number: '9876543211'
                },
                {
                    name: 'Dr. Robert Wilson',
                    specialization: 'Orthopedics',
                    clinicName: 'Joint & Bone Center',
                    phone_number: '9123456790'
                },
                {
                    name: 'Dr. Lisa Anderson',
                    specialization: 'Gynecology',
                    clinicName: 'Women\'s Health Center',
                    phone_number: '9876543212'
                }
            ];

            let completed = 0;
            sampleDoctors.forEach(doctor => {
                db.run(
                    `INSERT INTO doctors (name, specialization, clinicName, phone_number) VALUES (?, ?, ?, ?)`,
                    [doctor.name, doctor.specialization, doctor.clinicName, doctor.phone_number],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample doctor:', err);
                        } else {
                            console.log(`✅ Added sample doctor: ${doctor.name} (ID: ${this.lastID})`);
                        }
                        completed++;
                        if (completed === sampleDoctors.length) {
                            console.log('✅ Sample doctors initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} doctors`);
        }
    });
}

// Add sample users if empty
function addSampleUsersIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking users count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No users found, adding sample data...');
            const sampleUsers = [
                {
                    name: 'Admin User',
                    phone_number: '9876543210',
                    email: 'admin@thyrosoft.com',
                    password: 'admin123'
                },
                {
                    name: 'Dr. Sarah Wilson',
                    phone_number: '9123456789',
                    email: 'sarah.wilson@thyrosoft.com',
                    password: 'doctor123'
                },
                {
                    name: 'Manager Mike',
                    phone_number: '9988776655',
                    email: 'manager@thyrosoft.com',
                    password: 'manager123'
                }
            ];

            let completed = 0;
            sampleUsers.forEach(user => {
                db.run(
                    'INSERT INTO users (name, phone_number, email, password) VALUES (?, ?, ?, ?)',
                    [user.name, user.phone_number, user.email, user.password],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample user:', err);
                        } else {
                            console.log('✅ Added sample user: ' + user.name + ' (ID: ' + this.lastID + ')');
                        }
                        completed++;
                        if (completed === sampleUsers.length) {
                            console.log('✅ Sample users initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log('✅ Database already contains ' + row.count + ' users');
        }
    });
}

// Add sample branches if empty
function addSampleBranchesIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM branches', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking branches count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No branches found, adding sample data...');
            const sampleBranches = [
                {
                    branch_code: 'MB001',
                    branch_name: 'Main Branch',
                    phone_number: '9876543210',
                    address: '123 Main St, City, State'
                },
                {
                    branch_code: 'NB001',
                    branch_name: 'North Branch',
                    phone_number: '9123456789',
                    address: '456 Oak Ave, City, State'
                }
            ];

            let completed = 0;
            sampleBranches.forEach(branch => {
                db.run(
                    `INSERT INTO branches (branch_code, branch_name, phone_number, address) VALUES (?, ?, ?, ?)`,
                    [branch.branch_code, branch.branch_name, branch.phone_number, branch.address],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample branch:', err);
                        } else {
                            console.log(`✅ Added sample branch: ${branch.branch_name} (ID: ${this.lastID})`);
                        }
                        completed++;
                        if (completed === sampleBranches.length) {
                            console.log('✅ Sample branches initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} branches`);
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

// GET all branches
app.get('/api/branches', (req, res) => {
    console.log('🔍 GET /api/branches - Fetching branches...');

    // Check if branches table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='branches';", [], (err, table) => {
        if (err) {
            console.error('❌ Error checking for branches table:', err);
            return res.status(500).json({ error: 'Database error checking for branches table' });
        }

        if (!table) {
            console.error('❌ Branches table does not exist');
            return res.json([]);
        }

        console.log('✅ Branches table exists, querying data...');

        // Get all branches
        db.all('SELECT * FROM branches ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching branches:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log(`✅ Found ${rows.length} branches`);
            if (rows.length > 0) {
                console.log('Sample branch data:', JSON.stringify(rows[0], null, 2));
            }

            res.json(rows);
        });
    });
});

// POST new branch
app.post('/api/branches', (req, res) => {
    console.log('📥 Received branch data:', JSON.stringify(req.body, null, 2));

    const {
        branch_code,
        branch_name,
        phone_number,
        address
    } = req.body;

    // Validate required fields
    const requiredFields = { branch_code, branch_name };
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

        // Check if branch with this code already exists
        db.get('SELECT * FROM branches WHERE branch_code = ?', [branch_code], (err, existingBranch) => {
            if (err) {
                db.run('ROLLBACK');
                console.error('❌ Database error checking for existing branch:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Database error checking for existing branch',
                    error: err.message
                });
            }

            if (existingBranch) {
                db.run('ROLLBACK');
                console.error('❌ Branch with this code already exists');
                return res.status(409).json({
                    status: 'error',
                    message: 'A branch with this code already exists',
                    existingBranch: existingBranch
                });
            }

            // Insert new branch
            const stmt = db.prepare(`
                INSERT INTO branches (branch_code, branch_name, phone_number, address) VALUES (?, ?, ?, ?)
            `);

            stmt.run(
                branch_code,
                branch_name,
                phone_number || null,
                address || null,
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        stmt.finalize();
                        console.error('❌ Error inserting branch:', err);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Failed to save branch',
                            error: err.message
                        });
                    }

                    const branchId = this.lastID;
                    stmt.finalize();

                    // Get the newly created branch
                    db.get('SELECT * FROM branches WHERE id = ?', [branchId], (err, newBranch) => {
                        if (err) {
                            db.run('ROLLBACK');
                            console.error('❌ Error fetching created branch:', err);
                            return res.status(500).json({
                                status: 'error',
                                message: 'Error fetching created branch',
                                error: err.message
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ Error committing transaction:', err);
                                return res.status(500).json({
                                    status: 'error',
                                    message: 'Failed to save branch',
                                    error: err.message
                                });
                            }

                            console.log('✅ Branch created successfully:', newBranch);
                            res.status(201).json({
                                status: 'success',
                                data: newBranch,
                                message: 'Branch created successfully'
                            });
                        });
                    });
                }
            );
        });
    });
});

// PUT update branch
app.put('/api/branches/:id', (req, res) => {
    const {
        branch_code,
        branch_name,
        phone_number,
        address
    } = req.body;

    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: 'Branch ID is required' });
    }

    db.run(
        `UPDATE branches SET
            branch_code = COALESCE(?, branch_code),
            branch_name = COALESCE(?, branch_name),
            phone_number = COALESCE(?, phone_number),
            address = COALESCE(?, address)
        WHERE id = ?`,
        [branch_code, branch_name, phone_number, address, id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(400).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Branch not found' });
            }

            // Return the updated branch
            db.get('SELECT * FROM branches WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated branch:', err);
                    return res.status(500).json({ error: 'Error fetching updated branch' });
                }
                console.log('✅ Branch updated successfully:', row);
                res.json({
                    status: 'success',
                    data: row,
                    message: 'Branch updated successfully'
                });
            });
        }
    );
});

// DELETE branch
app.delete('/api/branches/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM branches WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        db.run('DELETE FROM branches WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ Branch deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'Branch deleted successfully',
                deletedBranch: row,
                changes: this.changes
            });
        });
    });
});

// GET all doctors
app.get('/api/doctors', (req, res) => {
    console.log('🔍 GET /api/doctors - Fetching doctors...');

    // Check if doctors table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='doctors';", [], (err, table) => {
        if (err) {
            console.error('❌ Error checking for doctors table:', err);
            return res.status(500).json({ error: 'Database error checking for doctors table' });
        }

        if (!table) {
            console.error('❌ Doctors table does not exist');
            return res.json([]);
        }

        console.log('✅ Doctors table exists, querying data...');

        // Get all doctors
        db.all('SELECT * FROM doctors ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching doctors:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log(`✅ Found ${rows.length} doctors`);
            if (rows.length > 0) {
                console.log('Sample doctor data:', JSON.stringify(rows[0], null, 2));
            }

            res.json(rows);
        });
    });
});

// POST new doctor
app.post('/api/doctors', (req, res) => {
    console.log('📥 Received doctor data:', JSON.stringify(req.body, null, 2));

    const {
        name,
        specialization,
        clinicName,
        phone_number
    } = req.body;

    // Validate required fields
    const requiredFields = { name, specialization, clinicName };
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

    // Insert new doctor
    const stmt = db.prepare(`
        INSERT INTO doctors (name, specialization, clinicName, phone_number) VALUES (?, ?, ?, ?)
    `);

    stmt.run(
        name,
        specialization,
        clinicName,
        phone_number || null,
        function(err) {
            if (err) {
                stmt.finalize();
                console.error('❌ Error inserting doctor:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to save doctor',
                    error: err.message
                });
            }

            const doctorId = this.lastID;
            stmt.finalize();

            // Get the newly created doctor
            db.get('SELECT * FROM doctors WHERE id = ?', [doctorId], (err, newDoctor) => {
                if (err) {
                    console.error('❌ Error fetching created doctor:', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error fetching created doctor',
                        error: err.message
                    });
                }

                console.log('✅ Doctor created successfully:', newDoctor);
                res.status(201).json({
                    status: 'success',
                    data: newDoctor,
                    message: 'Doctor created successfully'
                });
            });
        }
    );
});

// PUT update doctor
app.put('/api/doctors/:id', (req, res) => {
    const {
        name,
        specialization,
        clinicName,
        phone_number
    } = req.body;

    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: 'Doctor ID is required' });
    }

    db.run(
        `UPDATE doctors SET
            name = COALESCE(?, name),
            specialization = COALESCE(?, specialization),
            clinicName = COALESCE(?, clinicName),
            phone_number = COALESCE(?, phone_number)
        WHERE id = ?`,
        [name, specialization, clinicName, phone_number, id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(400).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Doctor not found' });
            }

            // Return the updated doctor
            db.get('SELECT * FROM doctors WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('Error fetching updated doctor:', err);
                    return res.status(500).json({ error: 'Error fetching updated doctor' });
                }
                console.log('✅ Doctor updated successfully:', row);
                res.json({
                    status: 'success',
                    data: row,
                    message: 'Doctor updated successfully'
                });
            });
        }
    );
});

// DELETE doctor
app.delete('/api/doctors/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM doctors WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        db.run('DELETE FROM doctors WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ Doctor deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'Doctor deleted successfully',
                deletedDoctor: row,
                changes: this.changes
            });
        });
    });
});

// ==================== USERS API ENDPOINTS ====================

// GET all users
app.get('/api/users', (req, res) => {
    console.log('🔍 GET /api/users - Fetching users...');

    db.all('SELECT id, name, phone_number, email, created_at FROM users', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching users:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log(`✅ Found ${rows.length} users`);
        res.json(rows);
    });
});

// POST create new user
app.post('/api/users', (req, res) => {
    const { name, phone_number, email, password } = req.body;
    console.log('📥 Received user data:', { name, phone_number, email });

    // Validate required fields
    if (!name || !phone_number || !email || !password) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['name', 'phone_number', 'email', 'password']
        });
    }

    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('❌ Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email' });
        }

        if (row) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Insert new user (Note: In production, you should hash the password!)
        db.run(
            `INSERT INTO users (name, phone_number, email, password) VALUES (?, ?, ?, ?)`,
            [name, phone_number, email, password],
            function(err) {
                if (err) {
                    console.error('❌ Error creating user:', err);
                    return res.status(400).json({ error: err.message });
                }

                const userId = this.lastID;
                db.get('SELECT id, name, phone_number, email, created_at FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) {
                        console.error('Error fetching created user:', err);
                        return res.status(500).json({ error: 'Error fetching created user' });
                    }
                    console.log('✅ User created successfully:', row);
                    res.status(201).json({
                        status: 'success',
                        data: row,
                        message: 'User created successfully'
                    });
                });
            }
        );
    });
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const { name, phone_number, email, password } = req.body;

    // Build update query dynamically based on provided fields
    let updates = [];
    let values = [];

    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (phone_number !== undefined) {
        updates.push('phone_number = ?');
        values.push(phone_number);
    }
    if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
    }
    if (password !== undefined) {
        updates.push('password = ?');
        values.push(password);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
        if (err) {
            console.error('❌ Error updating user:', err);
            return res.status(400).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.get('SELECT id, name, phone_number, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated user:', err);
                return res.status(500).json({ error: 'Error fetching updated user' });
            }
            console.log('✅ User updated successfully:', row);
            res.json({
                status: 'success',
                data: row,
                message: 'User updated successfully'
            });
        });
    });
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT id, name, email FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.run('DELETE FROM users WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ User deleted successfully:', row);
            res.json({
                status: 'success',
                message: 'User deleted successfully',
                deletedUser: row,
                changes: this.changes
            });
        });
    });
});

// ============================================
// REPORTS ENDPOINTS
// ============================================

// GET /api/reports/referrals - Fetch all referral reports
app.get('/api/reports/referrals', (req, res) => {
    console.log('🔍 GET /api/reports/referrals - Fetching referral reports...');
    
    // Query to get all sales with referral information
    const salesQuery = `
        SELECT 
            s.id,
            s.date,
            s.client_type,
            bc.institution_name as b2b_client_name,
            d.name as ref_by_doctor_name,
            s.patient_name,
            s.items as tests,
            s.advance as paid,
            s.balance_due as balance,
            s.status as payment_status
        FROM sales s
        LEFT JOIN b2b_clients bc ON s.b2b_client_id = bc.id
        LEFT JOIN doctors d ON s.ref_by_doctor_id = d.id
        WHERE s.ref_by_doctor_id IS NOT NULL OR s.b2b_client_id IS NOT NULL
        ORDER BY s.date DESC
    `;
    
    db.all(salesQuery, [], (err, sales) => {
        if (err) {
            console.error('❌ Error fetching sales:', err);
            return res.status(500).json({ error: 'Failed to fetch sales data' });
        }
        
        // Get all tests to fetch B2B prices
        db.all('SELECT testname, cost_b2b FROM tests', [], (testErr, tests) => {
            if (testErr) {
                console.error('❌ Error fetching tests:', testErr);
                return res.status(500).json({ error: 'Failed to fetch test prices' });
            }
            
            // Create a map of test names to B2B prices
            const testPriceMap = {};
            tests.forEach(test => {
                testPriceMap[test.testname] = parseFloat(test.cost_b2b) || 0;
            });
            
            // Group sales by doctor/B2B client
            const referralMap = {};
            
            sales.forEach(sale => {
                // Determine if this is a doctor referral or B2B client
                const referrerName = sale.ref_by_doctor_name || sale.b2b_client_name || 'Unknown';
                const referrerType = sale.ref_by_doctor_name ? 'doctor' : 'b2b';
                
                // Parse tests from JSON string
                let testList = [];
                try {
                    testList = sale.tests ? JSON.parse(sale.tests) : [];
                } catch (e) {
                    console.error('Error parsing tests:', e);
                    testList = [];
                }
                
                // Calculate B2B amount for this sale
                let b2bAmount = 0;
                const testNames = testList.map(test => {
                    const testName = typeof test === 'string' ? test : (test.name || test.testName || '');
                    const price = testPriceMap[testName] || 0;
                    b2bAmount += price;
                    return testName;
                });
                
                // Initialize referrer entry if it doesn't exist
                if (!referralMap[referrerName]) {
                    referralMap[referrerName] = {
                        doctor_or_b2b_client: referrerName,
                        type: referrerType,
                        total_referrals: 0,
                        patients: [],
                        total_amount: 0,
                        payment_status: 'paid',
                        created_at: sale.date
                    };
                }
                
                // Add patient info
                referralMap[referrerName].patients.push({
                    patient_name: sale.patient_name || 'Unknown',
                    tests: testNames,
                    b2b_amount: b2bAmount
                });
                
                // Update totals
                referralMap[referrerName].total_referrals += 1;
                referralMap[referrerName].total_amount += b2bAmount;
                
                // Update payment status - only 'paid' or 'pending'
                if (sale.payment_status && sale.payment_status.toLowerCase() !== 'paid') {
                    referralMap[referrerName].payment_status = 'pending';
                } else if (parseFloat(sale.balance_due || 0) > 0) {
                    referralMap[referrerName].payment_status = 'pending';
                }
            });
            
            // Convert map to array and add IDs
            const referralReports = Object.values(referralMap).map((report, index) => ({
                id: index + 1,
                ...report
            }));
            
            console.log(`✅ Found ${referralReports.length} referral reports`);
            res.json(referralReports);
        });
    });
});

// POST /api/reports/referrals/update-payment - Update payment status
app.post('/api/reports/referrals/update-payment', (req, res) => {
    const { doctor_or_b2b_client, payment_status } = req.body;
    
    if (!doctor_or_b2b_client || !payment_status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Update all sales for this doctor/B2B client
    const updateQuery = `
        UPDATE sales 
        SET status = ?
        WHERE ref_by_doctor_id IN (SELECT id FROM doctors WHERE name = ?)
           OR b2b_client_id IN (SELECT id FROM b2b_clients WHERE institution_name = ?)
    `;
    
    db.run(updateQuery, [payment_status, doctor_or_b2b_client, doctor_or_b2b_client], function(err) {
        if (err) {
            console.error('❌ Error updating payment status:', err);
            return res.status(500).json({ error: 'Failed to update payment status' });
        }
        
        res.json({ 
            success: true, 
            message: 'Payment status updated successfully',
            changes: this.changes 
        });
    });
});

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
    console.log('  GET  /api/branches - Get all branches');
    console.log('  POST /api/branches - Create new branch');
    console.log('  PUT  /api/branches/:id - Update branch');
    console.log('  DELETE /api/branches/:id - Delete branch');
    console.log('  GET  /api/doctors - Get all doctors');
    console.log('  POST /api/doctors - Create new doctor');
    console.log('  PUT  /api/doctors/:id - Update doctor');
    console.log('  DELETE /api/doctors/:id - Delete doctor');
    console.log('  GET  /api/users - Get all users');
    console.log('  POST /api/users - Create new user');
    console.log('  PUT  /api/users/:id - Update user');
    console.log('  DELETE /api/users/:id - Delete user');
    console.log('  GET  /api/b2b-clients - Get all B2B clients');
    console.log('  POST /api/b2b-clients - Create new B2B client');
    console.log('  PUT  /api/b2b-clients/:id - Update B2B client');
    console.log('  DELETE /api/b2b-clients/:id - Delete B2B client');

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
});
    console.log('  GET  /api/tests - Get all tests');
    console.log('  POST /api/tests - Create new test');
    console.log('  PUT  /api/tests/:id - Update test');
    console.log('  DELETE /api/tests/:id - Delete test');
    console.log('  GET  /api/testpackages - Get all test packages');
    console.log('  POST /api/testpackages - Create new test package');
    console.log('  PUT  /api/testpackages/:id - Update test package');
    console.log('  DELETE /api/testpackages/:id - Delete test package');

// ==================== B2B CLIENTS API ENDPOINTS ====================

// GET all B2B clients
app.get('/api/b2b-clients', (req, res) => {
    console.log('🔍 GET /api/b2b-clients - Fetching clients...');
    db.all('SELECT * FROM b2b_clients ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching B2B clients:', err);
            return res.status(400).json({ error: err.message });
        }
        console.log('✅ Found ' + rows.length + ' B2B clients');
        res.json(rows);
    });
});

// POST new B2B client
app.post('/api/b2b-clients', (req, res) => {
    const { institution_name, phone_number, address } = req.body;
    console.log('📥 Received B2B client data:', { institution_name, phone_number, address });

    if (!institution_name) {
        return res.status(400).json({ error: 'institution_name is required' });
    }

    // Check uniqueness
    db.get('SELECT id FROM b2b_clients WHERE institution_name = ?', [institution_name], (err, row) => {
        if (err) {
            console.error('❌ Error checking B2B client:', err);
            return res.status(500).json({ error: 'Error checking B2B client' });
        }
        if (row) {
            return res.status(409).json({ error: 'Institution name already exists' });
        }

        db.run(
            'INSERT INTO b2b_clients (institution_name, phone_number, address) VALUES (?, ?, ?)',
            [institution_name, phone_number || null, address || null],
            function(err) {
                if (err) {
                    console.error('❌ Error creating B2B client:', err);
                    return res.status(400).json({ error: err.message });
                }
                const id = this.lastID;
                db.get('SELECT * FROM b2b_clients WHERE id = ?', [id], (err, row) => {
                    if (err) {
                        console.error('Error fetching created B2B client:', err);
                        return res.status(500).json({ error: 'Error fetching created B2B client' });
                    }
                    console.log('✅ B2B client created successfully:', row);
                    res.status(201).json({ status: 'success', data: row, message: 'Client created successfully' });
                });
            }
        );
    });
});

// PUT update B2B client
app.put('/api/b2b-clients/:id', (req, res) => {
    const id = req.params.id;
    const { institution_name, phone_number, address } = req.body;

    let updates = [];
    let values = [];

    if (institution_name !== undefined) { updates.push('institution_name = ?'); values.push(institution_name); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); values.push(phone_number); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const sql = 'UPDATE b2b_clients SET ' + updates.join(', ') + ' WHERE id = ?';

    db.run(sql, values, function(err) {
        if (err) {
            console.error('❌ Error updating B2B client:', err);
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'B2B client not found' });
        }
        db.get('SELECT * FROM b2b_clients WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error fetching updated B2B client:', err);
                return res.status(500).json({ error: 'Error fetching updated B2B client' });
            }
            console.log('✅ B2B client updated successfully:', row);
            res.json({ status: 'success', data: row, message: 'Client updated successfully' });
        });
    });
});

// DELETE B2B client
app.delete('/api/b2b-clients/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM b2b_clients WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'B2B client not found' });
        }
        db.run('DELETE FROM b2b_clients WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            console.log('✅ B2B client deleted successfully:', row);
            res.json({ status: 'success', message: 'Client deleted successfully', deletedClient: row, changes: this.changes });
        });
    });
});

// ==================== SALES API ENDPOINTS ====================

// GET all sales
app.get('/api/sales', (req, res) => {
    const sql = `
        SELECT s.*, bc.institution_name, d.name AS doctor_name
        FROM sales s
        LEFT JOIN b2b_clients bc ON bc.id = s.b2b_client_id
        LEFT JOIN doctors d ON d.id = s.ref_by_doctor_id
        ORDER BY s.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching sales:', err);
            return res.status(500).json({ error: err.message });
        }
        const data = rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [] }));
        res.json(data);
    });
});

// POST create sale
app.post('/api/sales', (req, res) => {
    const {
        date,
        branch_id,
        b2b_client_id,
        ref_by_doctor_id,
        patient_id,
        patient_name,
        tests: items = [],
        discount_mode,
        discount_value,
        advance,
        total,
        balance_due,
        payment_method,
        status,
        client_type
    } = req.body;

    db.get('SELECT invoice_no FROM sales ORDER BY id DESC LIMIT 1', [], (err, row) => {
        if (err) {
            console.error('❌ Error generating invoice:', err);
            return res.status(500).json({ error: 'Error generating invoice' });
        }
        let nextNum = 1;
        if (row && row.invoice_no) {
            const match = String(row.invoice_no).match(/(\d+)$/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        const invoice_no = 'TC' + String(nextNum).padStart(7, '0');

        const sql = `INSERT INTO sales (
            invoice_no, client_type, branch_id, b2b_client_id, ref_by_doctor_id, patient_id, patient_name,
            items, discount_mode, discount_value, advance, total, balance_due, payment_method, status, date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [
            invoice_no,
            client_type,
            branch_id || null,
            b2b_client_id || null,
            ref_by_doctor_id || null,
            patient_id || null,
            patient_name || null,
            JSON.stringify(items || []),
            discount_mode || null,
            discount_value || 0,
            advance || 0,
            total || 0,
            balance_due || 0,
            payment_method || null,
            status || 'Pending',
            date || new Date().toISOString().split('T')[0]
        ], function(err) {
            if (err) {
                console.error('❌ Error creating sale:', err);
                return res.status(500).json({ error: err.message });
            }
            const id = this.lastID;
            db.get('SELECT * FROM sales WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error('❌ Error fetching created sale:', err);
                    return res.status(500).json({ error: 'Error fetching created sale' });
                }
                res.status(201).json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
            });
        });
    });
});

app.delete('/api/sales/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM sales WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        db.run('DELETE FROM sales WHERE id = ?', id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ status: 'success', message: 'Sale deleted successfully', deletedSale: row, changes: this.changes });
        });
    });
});

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
});
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
});
    console.log('  GET  /api/users - Get all users');
    console.log('  POST /api/users - Create new user');
    console.log('  PUT  /api/users/:id - Update user');
    console.log('  DELETE /api/users/:id - Delete user');
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
    // Do not exit; keep server running so DB is not closed unexpectedly
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Do not exit; keep server running so DB is not closed unexpectedly
});