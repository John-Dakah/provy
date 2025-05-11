-- Make sure we have the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (for multi-tenant support)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for authentication and basic user info)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Add foreign key to users table
ALTER TABLE users ADD CONSTRAINT fk_users_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table (extended user information)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position TEXT,
  status TEXT NOT NULL CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  location TEXT,
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT CHECK (status IN ('not-started', 'in-progress', 'completed', 'blocked')),
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'absent', 'leave', 'weekend')),
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Schedule table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('Regular', 'PTO', 'Holiday', 'Overtime')),
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vacancies/Job Openings
CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  status TEXT CHECK (status IN ('Open', 'Reviewing', 'Closed')),
  posted_date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applicants for vacancies
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  status TEXT CHECK (status IN ('Applied', 'Reviewing', 'Interviewed', 'Offered', 'Hired', 'Rejected')),
  applied_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('task', 'meeting', 'alert', 'employee', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('Attendance', 'Performance', 'Recruitment', 'HR', 'Compliance')),
  data JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security (RLS) policies
-- This ensures users can only access their own company's data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
-- Users can only see users from their company
CREATE POLICY users_company_policy ON users
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users can only see their own company
CREATE POLICY companies_policy ON companies
  USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users can only see departments from their company
CREATE POLICY departments_company_policy ON departments
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users can only see employees from their company
CREATE POLICY employees_company_policy ON employees
  USING (user_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())));

-- Users can only see tasks from their company
CREATE POLICY tasks_company_policy ON tasks
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users can only see attendance records from their company
CREATE POLICY attendance_company_policy ON attendance
  USING (employee_id IN (SELECT id FROM employees WHERE user_id IN 
    (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))));

-- Users can only see schedules from their company
CREATE POLICY schedules_company_policy ON schedules
  USING (employee_id IN (SELECT id FROM employees WHERE user_id IN 
    (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))));

-- Users can only see vacancies from their company
CREATE POLICY vacancies_company_policy ON vacancies
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users can only see applicants for vacancies from their company
CREATE POLICY applicants_company_policy ON applicants
  USING (vacancy_id IN (SELECT id FROM vacancies WHERE company_id = 
    (SELECT company_id FROM users WHERE id = auth.uid())));

-- Users can only see messages they sent or received
CREATE POLICY messages_user_policy ON messages
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can only see their own notifications
CREATE POLICY notifications_user_policy ON notifications
  USING (user_id = auth.uid());

-- Users can only see reports from their company
CREATE POLICY reports_company_policy ON reports
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_schedules_employee ON schedules(employee_id);
CREATE INDEX idx_vacancies_company ON vacancies(company_id);
CREATE INDEX idx_applicants_vacancy ON applicants(vacancy_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reports_company ON reports(company_id);
