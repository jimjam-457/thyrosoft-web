const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
console.log('🔧 Adding Tests and Test Packages tables to server.js...');

// Read the server.js file
let content = fs.readFileSync(serverPath, 'utf8');

// Add table creation for tests and testpackages
content = content.replace(
    'CREATE TABLE IF NOT EXISTS users',
    `CREATE TABLE IF NOT EXISTS tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        testname TEXT NOT NULL UNIQUE,
        cost_b2c DECIMAL(10,2) NOT NULL,
        cost_b2b DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testpackages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        testpackage_name TEXT NOT NULL UNIQUE,
        no_of_tests INTEGER NOT NULL,
        list_of_tests TEXT NOT NULL,
        cost_b2c DECIMAL(10,2) NOT NULL,
        cost_b2b DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users`);

// Add sample data functions
content = content.replace(
    'console.log(\`✅ Database already contains \${row.count} users\`);',
    `console.log(\`✅ Database already contains \${row.count} users\`);
        }
    });
}

// Add sample tests if empty
function addSampleTestsIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM tests', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking tests count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No tests found, adding sample data...');
            const sampleTests = [
                {
                    testname: 'Complete Blood Count (CBC)',
                    cost_b2c: 500.00,
                    cost_b2b: 400.00
                },
                {
                    testname: 'Thyroid Function Test (TFT)',
                    cost_b2c: 800.00,
                    cost_b2b: 650.00
                },
                {
                    testname: 'Lipid Profile',
                    cost_b2c: 600.00,
                    cost_b2b: 480.00
                },
                {
                    testname: 'HbA1c (Diabetes Test)',
                    cost_b2c: 400.00,
                    cost_b2b: 320.00
                },
                {
                    testname: 'Liver Function Test (LFT)',
                    cost_b2c: 700.00,
                    cost_b2b: 560.00
                },
                {
                    testname: 'Kidney Function Test (KFT)',
                    cost_b2c: 650.00,
                    cost_b2b: 520.00
                }
            ];

            let completed = 0;
            sampleTests.forEach(test => {
                db.run(
                    'INSERT INTO tests (testname, cost_b2c, cost_b2b) VALUES (?, ?, ?)',
                    [test.testname, test.cost_b2c, test.cost_b2b],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample test:', err);
                        } else {
                            console.log('✅ Added sample test: ' + test.testname + ' (ID: ' + this.lastID + ')');
                        }
                        completed++;
                        if (completed === sampleTests.length) {
                            console.log('✅ Sample tests initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log('✅ Database already contains ' + row.count + ' tests');
        }
    });
}

// Add sample test packages if empty
function addSampleTestPackagesIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM testpackages', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking test packages count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No test packages found, adding sample data...');
            const sampleTestPackages = [
                {
                    testpackage_name: 'Basic Health Checkup',
                    no_of_tests: 3,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT)',
                    cost_b2c: 1500.00,
                    cost_b2b: 1200.00
                },
                {
                    testpackage_name: 'Comprehensive Health Package',
                    no_of_tests: 5,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT), Liver Function Test (LFT), Kidney Function Test (KFT)',
                    cost_b2c: 2500.00,
                    cost_b2b: 2000.00
                },
                {
                    testpackage_name: 'Diabetes Screening Package',
                    no_of_tests: 2,
                    list_of_tests: 'HbA1c (Diabetes Test), Lipid Profile',
                    cost_b2c: 900.00,
                    cost_b2b: 720.00
                },
                {
                    testpackage_name: 'Senior Citizen Package',
                    no_of_tests: 6,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT), Liver Function Test (LFT), Kidney Function Test (KFT), HbA1c (Diabetes Test)',
                    cost_b2c: 3200.00,
                    cost_b2b: 2560.00
                }
            ];

            let completed = 0;
            sampleTestPackages.forEach(pkg => {
                db.run(
                    'INSERT INTO testpackages (testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b) VALUES (?, ?, ?, ?, ?)',
                    [pkg.testpackage_name, pkg.no_of_tests, pkg.list_of_tests, pkg.cost_b2c, pkg.cost_b2b],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample test package:', err);
                        } else {
                            console.log('✅ Added sample test package: ' + pkg.testpackage_name + ' (ID: ' + this.lastID + ')');
                        }
                        completed++;
                        if (completed === sampleTestPackages.length) {
                            console.log('✅ Sample test packages initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log('✅ Database already contains ' + row.count + ' test packages');
        }
    });
}`);

// Update the initialization chain to include tests and testpackages
content = content.replace(
    'console.log(\`✅ Database already contains \${row.count} users\`);\n        }',
    `console.log(\`✅ Database already contains \${row.count} users\`);
        }
    });
}

// Add sample tests if empty
function addSampleTestsIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM tests', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking tests count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No tests found, adding sample data...');
            const sampleTests = [
                {
                    testname: 'Complete Blood Count (CBC)',
                    cost_b2c: 500.00,
                    cost_b2b: 400.00
                },
                {
                    testname: 'Thyroid Function Test (TFT)',
                    cost_b2c: 800.00,
                    cost_b2b: 650.00
                },
                {
                    testname: 'Lipid Profile',
                    cost_b2c: 600.00,
                    cost_b2b: 480.00
                },
                {
                    testname: 'HbA1c (Diabetes Test)',
                    cost_b2c: 400.00,
                    cost_b2b: 320.00
                },
                {
                    testname: 'Liver Function Test (LFT)',
                    cost_b2c: 700.00,
                    cost_b2b: 560.00
                },
                {
                    testname: 'Kidney Function Test (KFT)',
                    cost_b2c: 650.00,
                    cost_b2b: 520.00
                }
            ];

            let completed = 0;
            sampleTests.forEach(test => {
                db.run(
                    'INSERT INTO tests (testname, cost_b2c, cost_b2b) VALUES (?, ?, ?)',
                    [test.testname, test.cost_b2c, test.cost_b2b],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample test:', err);
                        } else {
                            console.log('✅ Added sample test: ' + test.testname + ' (ID: ' + this.lastID + ')');
                        }
                        completed++;
                        if (completed === sampleTests.length) {
                            console.log('✅ Sample tests initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log('✅ Database already contains ' + row.count + ' tests');
            addSampleTestPackagesIfEmpty();
        }
    });
}

// Add sample test packages if empty
function addSampleTestPackagesIfEmpty() {
    db.get('SELECT COUNT(*) as count FROM testpackages', [], (err, row) => {
        if (err) {
            console.error('❌ Error checking test packages count:', err);
            return;
        }

        if (row.count === 0) {
            console.log('ℹ️  No test packages found, adding sample data...');
            const sampleTestPackages = [
                {
                    testpackage_name: 'Basic Health Checkup',
                    no_of_tests: 3,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT)',
                    cost_b2c: 1500.00,
                    cost_b2b: 1200.00
                },
                {
                    testpackage_name: 'Comprehensive Health Package',
                    no_of_tests: 5,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT), Liver Function Test (LFT), Kidney Function Test (KFT)',
                    cost_b2c: 2500.00,
                    cost_b2b: 2000.00
                },
                {
                    testpackage_name: 'Diabetes Screening Package',
                    no_of_tests: 2,
                    list_of_tests: 'HbA1c (Diabetes Test), Lipid Profile',
                    cost_b2c: 900.00,
                    cost_b2b: 720.00
                },
                {
                    testpackage_name: 'Senior Citizen Package',
                    no_of_tests: 6,
                    list_of_tests: 'Complete Blood Count (CBC), Lipid Profile, Thyroid Function Test (TFT), Liver Function Test (LFT), Kidney Function Test (KFT), HbA1c (Diabetes Test)',
                    cost_b2c: 3200.00,
                    cost_b2b: 2560.00
                }
            ];

            let completed = 0;
            sampleTestPackages.forEach(pkg => {
                db.run(
                    'INSERT INTO testpackages (testpackage_name, no_of_tests, list_of_tests, cost_b2c, cost_b2b) VALUES (?, ?, ?, ?, ?)',
                    [pkg.testpackage_name, pkg.no_of_tests, pkg.list_of_tests, pkg.cost_b2c, pkg.cost_b2b],
                    function(err) {
                        if (err) {
                            console.error('❌ Error adding sample test package:', err);
                        } else {
                            console.log('✅ Added sample test package: ' + pkg.testpackage_name + ' (ID: ' + this.lastID + ')');
                        }
                        completed++;
                        if (completed === sampleTestPackages.length) {
                            console.log('✅ Sample test packages initialization complete');
                        }
                    }
                );
            });
        } else {
            console.log('✅ Database already contains ' + row.count + ' test packages');
        }
    });
}`);

// Update the users function to call tests initialization
content = content.replace(
    'console.log(\`✅ Database already contains \${row.count} users\`);\n        }',
    `console.log(\`✅ Database already contains \${row.count} users\`);
            addSampleTestsIfEmpty();
        }
    });
}`);

// Add API endpoints for tests
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
    console.log('  DELETE /api/testpackages/:id - Delete test package');`);

// Write the updated file
fs.writeFileSync(serverPath, content);
console.log('✅ Added Tests and Test Packages tables to server.js!');
console.log('✅ Added sample data initialization functions');
console.log('✅ Updated initialization chain');
console.log('🔄 Please restart the backend server to create the new tables...');
