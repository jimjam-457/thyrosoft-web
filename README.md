# Thyrosoft - Patient Management System

A full-stack patient management application with React frontend and Node.js/Express backend with SQLite database.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run backend
```
Backend will run on: `http://localhost:3771`

### 3. Start the Frontend (in another terminal)
```bash
npm start
```
Frontend will run on: `http://localhost:3000`

## Project Structure
```
thyrosoft_web/
├── public/                 # React public files
├── src/                    # React source code
│   ├── components/         # React components
│   └── ...
├── server.js              # Backend server
├── thyrosoft.db           # SQLite database (created automatically)
├── package.json           # Frontend + Backend dependencies
└── README.md
```

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test` | Test database connection |
| GET | `/api/health` | Server health check |
| GET | `/api/patients` | Get all patients |
| POST | `/api/patients` | Create new patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |

## Database Schema

### Patients Table
- `id` - Primary Key (Auto-increment)
- `name` - Patient full name
- `patient_id` - Unique patient identifier
- `barcode_number` - Test barcode
- `test_type` - Type of medical test
- `date` - Test/appointment date
- `doctor_referred` - Referring doctor
- `branch` - Medical branch location
- `price` - Test cost
- `contact_number` - Patient phone
- `address` - Patient address
- `gender` - Patient gender
- `age` - Patient age
- `email` - Patient email
- `created_at` - Record creation timestamp

## Development Commands

### Frontend Only
```bash
npm start          # Start React development server
npm run build      # Build for production
npm test           # Run tests
npm run deploy     # Deploy to GitHub Pages
```

### Backend Only
```bash
npm run backend    # Start backend server
npm run backend:dev # Start backend with auto-restart (requires nodemon)
```

### Both Frontend and Backend
1. **Terminal 1:** `npm run backend` (starts server on port 3771)
2. **Terminal 2:** `npm start` (starts React on port 3000)

## API Configuration

The React frontend is configured to connect to the backend at:
```
http://localhost:3771/api
```
If you need to change the API URL, update it in:
- `src/components/AddNew/AddNew.tsx` (line ~110)

## Sample Data

The backend automatically creates sample patient data when the database is empty. You can also add patients through the web interface.

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000`
- `http://localhost:3771` (Backend server)
- `http://127.0.0.1:3771`

## Troubleshooting

### Port Already in Use
If port 3771 is busy:
```bash
# Find and kill process using port 3771
netstat -ano | findstr :3771
taskkill /PID <PID> /F
```

### Database Issues
- Database file: `thyrosoft.db`
- If database is locked, stop all Node processes and restart
- Database supports concurrent reads via WAL mode

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the server console for backend errors
3. Verify both servers are running on correct ports
4. Ensure database file has proper permissions

## Development Workflow

1. **Start Backend:** `npm run backend`
2. **Start Frontend:** `npm start`
3. **Make Changes:** Edit React components in `src/`
4. **Test API:** Use `/api/test` endpoint to verify connection
5. **View Results:** Changes reflect automatically in browser

The application supports hot reloading for both frontend and backend development!

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
