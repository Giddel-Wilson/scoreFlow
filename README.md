# ScoreFlow - CA Records Management System

ScoreFlow is a comprehensive online continuous assessment (CA) records management portal designed for academic institutions. It provides role-based access control for lecturers, Heads of Departments (HODs), and administrators.

## Features Completed

### 🔐 Authentication & Authorization
- JWT-based authentication with secure HTTP-only cookies
- Role-based access control (LECTURER, HOD, ADMIN)
- Password reset functionality with email notifications
- Session management with automatic logout
- Comprehensive audit logging

### 👨‍🏫 Lecturer Features
- View assigned courses for the current session
- Enter CA scores for students (0-30 marks with 0.5 increments)
- Save scores as drafts before submission
- Submit final scores (with confirmation)
- Real-time autosave functionality (saves every 30 seconds)
- Local storage backup for unsaved work
- Score validation and status indicators

### 👔 HOD Features
- Department dashboard with comprehensive overview
- Filter courses by level, semester, lecturer, and submission status
- View detailed course information and statistics
- Monitor submission progress across department
- Export CA sheets as PDF (formatted for printing)
- Export data as CSV for analysis
- Real-time statistics and progress tracking

### 🔧 Admin Features
- **User Management**: Create, view, and delete users with role assignment
- **Course Management**: Create, view, and delete courses
- **Audit Logs**: View and export system activity logs with filtering
- **System Reports**: Department overview with statistics
- Multi-tab interface for efficient administration
- Comprehensive filtering and search capabilities

### 📊 Reporting & Export
- PDF export with institutional formatting
- CSV export for data analysis
- Audit log exports for compliance
- Printable CA sheets with signature spaces
- Department performance statistics

### 🛠 Technical Features
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: SvelteKit with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express-like API routes
- **Security**: Password hashing, CSRF protection, SQL injection prevention
- **Performance**: Optimized queries and efficient data loading
- **Accessibility**: Proper form labels and keyboard navigation

## Database Schema

### Core Models
- **Users**: Lecturers, HODs, and Admins with department assignments
- **Departments**: Academic departments
- **Courses**: Course definitions with levels and semesters
- **Students**: Student records with registration numbers
- **CourseAssignments**: Lecturer-to-course assignments
- **CAScores**: Individual student scores with submission tracking
- **AuditLogs**: System activity tracking
- **PasswordResetTokens**: Secure password reset functionality

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/scoreflow"
JWT_SECRET="your-secure-jwt-secret-key"
```

### Database Commands
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

## Default User Accounts

After seeding, you can login with:

### Admin Account
- **Email**: admin@university.edu
- **Password**: admin123
- **Role**: ADMIN

### HOD Account  
- **Email**: hod.cs@university.edu
- **Password**: hod123
- **Role**: HOD (Computer Science)

### Lecturer Accounts
- **Email**: lecturer1@university.edu
- **Password**: lecturer123
- **Role**: LECTURER (Computer Science)

## Development

```bash
# Start development server
npm run dev

# Run type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Lecturer Routes
- `GET /lecturer/courses` - View assigned courses
- `GET /lecturer/courses/[id]/scores` - Enter/edit scores
- `POST /lecturer/courses/[id]/scores?/saveScores` - Save draft scores
- `POST /lecturer/courses/[id]/scores?/submitScores` - Submit final scores

### HOD Routes
- `GET /hod/department` - Department dashboard
- `GET /hod/courses/[id]/view` - View course details
- `GET /hod/courses/[id]/export` - Export CA sheets (PDF/CSV)

### Admin Routes
- `GET /admin/manage` - Administration interface
- `POST /admin/manage?/createUser` - Create new user
- `POST /admin/manage?/deleteUser` - Delete user
- `POST /admin/manage?/createCourse` - Create new course
- `POST /admin/manage?/deleteCourse` - Delete course

## Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Security**: Secure token generation and validation
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CSRF Protection**: SvelteKit built-in CSRF protection
- **Session Security**: HTTP-only cookies with secure flags

## Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Lazy Loading**: Efficient data loading strategies
- **Caching**: Strategic use of browser and server caching
- **Bundle Optimization**: Code splitting and tree shaking

## Future Enhancements

- Email integration for password resets
- Advanced reporting with charts and graphs
- Mobile application companion
- Integration with student information systems
- Backup and disaster recovery features
- Multi-session support
- Grade analytics and insights

## License

This project is developed for educational institutions. Please ensure compliance with your institution's data protection and privacy policies.

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
