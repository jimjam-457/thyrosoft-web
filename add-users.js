const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'thyrosoft.db');
console.log(`🔍 Using database at: ${dbPath}`);

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
        addSampleUsers();
    }
});

// Add sample users
function addSampleUsers() {
    db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking users count:', err);
            return;
        }

        console.log(`📊 Current users count: ${row.count}`);

        if (row.count === 0) {
            console.log('ℹ️  Adding sample users...');
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
                    `INSERT INTO users (name, phone_number, email, password) VALUES (?, ?, ?, ?)`,
                    [user.name, user.phone_number, user.email, user.password],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample user:', err);
                        } else {
                            console.log(`✅ Added sample user: ${user.name} (ID: ${this.lastID})`);
                        }
                        completed++;
                        if (completed === sampleUsers.length) {
                            console.log('✅ Sample users added successfully!');
                            console.log('🔄 You can now refresh the Users page in the frontend.');
                            db.close();
                        }
                    }
                );
            });
        } else {
            console.log(`✅ Database already contains ${row.count} users`);
            console.log('🔄 Users should now load in the frontend.');
            db.close();
        }
    });
}
