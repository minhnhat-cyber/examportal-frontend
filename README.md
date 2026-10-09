# ExamPortal Frontend

ExamPortal is an online multiple-choice examination management system for teachers and students. This repository contains the responsive web interface and communicates with the ExamPortal REST API.

## Team members

- Nguyen Nhat Minh
- Krisdipas Kongsakul

## Project repositories

- [Frontend](https://github.com/minhnhat-cyber/examportal-frontend)
- [REST API](https://github.com/minhnhat-cyber/examportal-api)

## Main features

### Teacher portal

- Dashboard with exam, question, attempt, and score summaries
- Question bank CRUD operations
- Exam CRUD operations and question selection
- Student account CRUD operations
- Attempt and result review
- Reports and teacher profile settings

### Student portal

- Dashboard with available exams and recent results
- Start and resume an examination
- Timed multiple-choice examination interface
- Automatic answer saving and submission when time expires
- Result history and marked-answer review
- Student profile and password update

## Technology

- React 19
- Vite 8
- React Router
- Material UI icons
- Tailwind CSS
- REST API integration

## Requirements

- Node.js 20 or later
- npm
- A running copy of the [ExamPortal API](https://github.com/minhnhat-cyber/examportal-api)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.development`:

   ```env
   VITE_API_URL=http://localhost:3000/backend
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`.

Sign in at `/login`. Your account role opens the teacher portal at `/teacher` or the student portal at `/student`. The navigation shows the signed-in account and includes a working logout button. On mobile, use Menu to expand navigation.

For seeded demonstration accounts, see the API README. Change demo passwords before real use. Exam cards show local opening/closing times and ask for confirmation before starting or resuming. Teachers can search the question selector and see publication-status guidance when editing exams.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`. Deploy them to a web server or virtual machine and configure the server to return `index.html` for client-side routes.


## Current project scope

The proof of concept focuses on multiple-choice examinations. Webcam monitoring, AI proctoring, video calls, essay grading, and advanced anti-cheating features are outside the committed scope.

## License

This project was created for academic use.
