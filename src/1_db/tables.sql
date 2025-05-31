-- ===============================
-- VIRTUAL CLASSROOM DATABASE
-- PostgreSQL - Full Structure (camelCase, English)
-- ===============================

-- ============ BASE TABLES ============


CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
	description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    roleId INTEGER REFERENCES role(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roleRequestStatus(
	id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
	description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roleRequest (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    requestedRoleId INTEGER NOT NULL REFERENCES roles(id),
    status INTEGER REFERENCES roleRequestStatus(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TYPES ============

CREATE TABLE activityTypes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questionTypes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ COURSES ============

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    inviteCode VARCHAR(20) UNIQUE NOT NULL,
    teacherId INTEGER REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courseStudents (
    id SERIAL PRIMARY KEY,
    courseId INTEGER REFERENCES courses(id),
    studentId INTEGER REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ COURSE CONTENTS (Announcements, Materials) ============

CREATE TABLE contentTypes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'pdf', 'image', 'video', 'announcement'
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courseContents (
    id SERIAL PRIMARY KEY,
    courseId INTEGER REFERENCES courses(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    file TEXT, -- Path or URL to PDF, image, video, etc.
    contentTypeId INTEGER REFERENCES contentTypes(id), -- 'announcement', 'pdf', 'image', 'video', etc.
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ACTIVITIES ============

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    courseId INTEGER REFERENCES courses(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    typeId INTEGER REFERENCES activityTypes(id),
    dueDate DATE,
    file TEXT, -- Path to PDF or material
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ACTIVITY STUDENT PROGRESS ============

CREATE TABLE activityStudents (
    id SERIAL PRIMARY KEY,
    activityId INTEGER REFERENCES activities(id),
    studentId INTEGER REFERENCES users(id),
    submitted BOOLEAN DEFAULT FALSE,
    grade NUMERIC(5,2),
    feedback TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ QUIZZES ============

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    activityId INTEGER REFERENCES activities(id),
    content TEXT NOT NULL,
    typeId INTEGER REFERENCES questionTypes(id),
    questionOrder INTEGER DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answerOptions (
    id SERIAL PRIMARY KEY,
    questionId INTEGER REFERENCES questions(id),
    text TEXT NOT NULL,
    isCorrect BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE studentAnswers (
    id SERIAL PRIMARY KEY,
    questionId INTEGER REFERENCES questions(id),
    studentId INTEGER REFERENCES users(id),
    answerText TEXT,
    answerOptionId INTEGER REFERENCES answerOptions(id),
    answerDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===============================
-- INITIAL DATA (Optional)
-- ===============================

-- Roles
INSERT INTO roles (name, description) VALUES 
('student', 'Regular student enrolled in a course'),
('professor', 'Instructor who manages and evaluates the course'),
('admin', 'Administrator with management permissions'),
('superuser', 'Superuser with full access to all resources');

-- Role request status 
INSERT INTO roleRequestStatus (name, description) VALUES 
('pending', 'The role request has been submitted and is waiting for review or approval by an administrator'),
('aproved', 'The role request has been reviewed and granted. The user now has the requested role'),
('rejected', 'The role request was reviewed and denied. The user will not receive the requested role');

-- Activity Types
INSERT INTO activityTypes (name, description) VALUES 
('assignment', 'Teacher-assigned tasks'),
('homework', 'Homework to be done at home'),
('evaluation', 'Tests or exams');

-- Question Types
INSERT INTO questionTypes (name, description) VALUES
('multiple_choice', 'Question with multiple options'),
('free_text', 'Open-ended written response'),
('boolean', 'Yes/No question');

INSERT INTO contentTypes (name, description) VALUES
('announcement', 'Text notice from teacher'),
('pdf', 'PDF document'),
('image', 'Image file'),
('video', 'Video material'),
('link', 'External link to resource');
