-- First, drop any existing policies to start fresh
DROP POLICY IF EXISTS users_company_policy ON users;
DROP POLICY IF EXISTS companies_policy ON companies;
DROP POLICY IF EXISTS departments_company_policy ON departments;
DROP POLICY IF EXISTS employees_company_policy ON employees;
DROP POLICY IF EXISTS tasks_company_policy ON tasks;
DROP POLICY IF EXISTS attendance_company_policy ON attendance;
DROP POLICY IF EXISTS schedules_company_policy ON schedules;
DROP POLICY IF EXISTS vacancies_company_policy ON vacancies;
DROP POLICY IF EXISTS applicants_company_policy ON applicants;
DROP POLICY IF EXISTS messages_user_policy ON messages;
DROP POLICY IF EXISTS notifications_user_policy ON notifications;
DROP POLICY IF EXISTS reports_company_policy ON reports;

-- Make sure RLS is enabled on all tables
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

-- Create a policy for companies table that allows insertion during registration
-- and viewing only the user's company
CREATE POLICY companies_insert_policy ON companies
  FOR INSERT
  WITH CHECK (true);  -- Allow any authenticated user to insert a company

CREATE POLICY companies_select_policy ON companies
  FOR SELECT
  USING (id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Create a policy for users table that allows insertion during registration
-- and viewing only users from the same company
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);  -- Users can only insert their own record

CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Departments policies
CREATE POLICY departments_select_policy ON departments
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY departments_insert_policy ON departments
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY departments_update_policy ON departments
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY departments_delete_policy ON departments
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Employees policies
CREATE POLICY employees_select_policy ON employees
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY employees_insert_policy ON employees
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY employees_update_policy ON employees
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY employees_delete_policy ON employees
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Tasks policies
CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Attendance policies
CREATE POLICY attendance_select_policy ON attendance
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY attendance_insert_policy ON attendance
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY attendance_update_policy ON attendance
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY attendance_delete_policy ON attendance
  FOR DELETE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- Schedules policies
CREATE POLICY schedules_select_policy ON schedules
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY schedules_insert_policy ON schedules
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY schedules_update_policy ON schedules
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY schedules_delete_policy ON schedules
  FOR DELETE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id IN (
        SELECT id FROM users WHERE company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- Vacancies policies
CREATE POLICY vacancies_select_policy ON vacancies
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY vacancies_insert_policy ON vacancies
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY vacancies_update_policy ON vacancies
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY vacancies_delete_policy ON vacancies
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Applicants policies
CREATE POLICY applicants_select_policy ON applicants
  FOR SELECT
  USING (
    vacancy_id IN (
      SELECT id FROM vacancies WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY applicants_insert_policy ON applicants
  FOR INSERT
  WITH CHECK (
    vacancy_id IN (
      SELECT id FROM vacancies WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY applicants_update_policy ON applicants
  FOR UPDATE
  USING (
    vacancy_id IN (
      SELECT id FROM vacancies WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY applicants_delete_policy ON applicants
  FOR DELETE
  USING (
    vacancy_id IN (
      SELECT id FROM vacancies WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Messages policies
CREATE POLICY messages_select_policy ON messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY messages_insert_policy ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

CREATE POLICY messages_update_policy ON messages
  FOR UPDATE
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY messages_delete_policy ON messages
  FOR DELETE
  USING (
    sender_id = auth.uid()
  );

-- Notifications policies
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );

CREATE POLICY notifications_delete_policy ON notifications
  FOR DELETE
  USING (
    user_id = auth.uid()
  );

-- Reports policies
CREATE POLICY reports_select_policy ON reports
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY reports_insert_policy ON reports
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY reports_update_policy ON reports
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY reports_delete_policy ON reports
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );
