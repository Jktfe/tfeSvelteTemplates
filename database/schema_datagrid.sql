-- DataGrid Component Schema
-- Sample employee data for demonstrating grid features

-- Create employees table with various data types
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    location VARCHAR(100),
    phone VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data with realistic employee records
INSERT INTO employees (first_name, last_name, email, department, position, salary, hire_date, status, location, phone, notes) VALUES
    ('Sarah', 'Johnson', 'sarah.johnson@company.com', 'Engineering', 'Senior Developer', 95000.00, '2020-03-15', 'active', 'London', '+44 20 7946 0958', 'Team lead for backend services'),
    ('James', 'Smith', 'james.smith@company.com', 'Engineering', 'DevOps Engineer', 88000.00, '2021-06-01', 'active', 'Manchester', '+44 161 850 2000', 'AWS infrastructure specialist'),
    ('Emily', 'Brown', 'emily.brown@company.com', 'Design', 'UX Designer', 72000.00, '2019-09-20', 'active', 'London', '+44 20 7946 0123', 'Leading design system initiative'),
    ('Michael', 'Davis', 'michael.davis@company.com', 'Sales', 'Account Executive', 65000.00, '2022-01-10', 'active', 'Birmingham', '+44 121 234 5678', 'Enterprise accounts focus'),
    ('Jessica', 'Wilson', 'jessica.wilson@company.com', 'Marketing', 'Marketing Manager', 78000.00, '2020-11-05', 'active', 'London', '+44 20 7946 0456', 'Digital marketing campaigns'),
    ('David', 'Taylor', 'david.taylor@company.com', 'Engineering', 'Frontend Developer', 82000.00, '2021-03-22', 'active', 'Leeds', '+44 113 243 2635', 'React and Svelte specialist'),
    ('Laura', 'Anderson', 'laura.anderson@company.com', 'HR', 'HR Manager', 70000.00, '2018-07-14', 'active', 'London', '+44 20 7946 0789', 'Recruitment and onboarding'),
    ('Robert', 'Thomas', 'robert.thomas@company.com', 'Finance', 'Financial Analyst', 68000.00, '2021-08-30', 'active', 'Edinburgh', '+44 131 225 2383', 'Budget planning and analysis'),
    ('Sophie', 'Jackson', 'sophie.jackson@company.com', 'Engineering', 'QA Engineer', 75000.00, '2020-05-18', 'active', 'Bristol', '+44 117 927 7000', 'Automated testing framework'),
    ('Daniel', 'White', 'daniel.white@company.com', 'Design', 'Product Designer', 76000.00, '2019-12-03', 'active', 'London', '+44 20 7946 0321', 'Mobile app design'),
    ('Emma', 'Harris', 'emma.harris@company.com', 'Sales', 'Sales Director', 105000.00, '2017-04-25', 'active', 'London', '+44 20 7946 0654', 'Leading sales team of 12'),
    ('Thomas', 'Martin', 'thomas.martin@company.com', 'Engineering', 'CTO', 135000.00, '2016-02-01', 'active', 'London', '+44 20 7946 0111', 'Technology strategy and leadership'),
    ('Olivia', 'Thompson', 'olivia.thompson@company.com', 'Marketing', 'Content Manager', 62000.00, '2022-04-12', 'active', 'Manchester', '+44 161 850 2100', 'Blog and social media content'),
    ('William', 'Garcia', 'william.garcia@company.com', 'Engineering', 'Junior Developer', 52000.00, '2023-01-09', 'active', 'London', '+44 20 7946 0987', 'Graduate hire, learning full-stack'),
    ('Amelia', 'Martinez', 'amelia.martinez@company.com', 'Customer Success', 'Support Manager', 58000.00, '2021-10-15', 'active', 'Glasgow', '+44 141 221 9600', 'Customer support team lead'),
    ('George', 'Robinson', 'george.robinson@company.com', 'Finance', 'CFO', 125000.00, '2017-08-20', 'active', 'London', '+44 20 7946 0222', 'Financial strategy and operations'),
    ('Charlotte', 'Clark', 'charlotte.clark@company.com', 'Design', 'UI Designer', 69000.00, '2022-02-28', 'active', 'Brighton', '+44 1273 606 755', 'Component library maintenance'),
    ('Jack', 'Rodriguez', 'jack.rodriguez@company.com', 'Engineering', 'Data Engineer', 92000.00, '2020-09-07', 'active', 'London', '+44 20 7946 0555', 'ETL pipelines and data warehouse'),
    ('Isla', 'Lewis', 'isla.lewis@company.com', 'Sales', 'Sales Representative', 55000.00, '2022-11-21', 'active', 'Liverpool', '+44 151 231 1001', 'SMB accounts specialist'),
    ('Harry', 'Lee', 'harry.lee@company.com', 'Engineering', 'Security Engineer', 98000.00, '2019-06-10', 'active', 'London', '+44 20 7946 0333', 'Application security and pen testing'),
    ('Mia', 'Walker', 'mia.walker@company.com', 'HR', 'Recruiter', 48000.00, '2023-03-01', 'active', 'London', '+44 20 7946 0888', 'Technical recruitment'),
    ('Oscar', 'Hall', 'oscar.hall@company.com', 'Marketing', 'SEO Specialist', 58000.00, '2021-12-06', 'active', 'Remote', '+44 20 7946 0777', 'Organic search optimization'),
    ('Grace', 'Allen', 'grace.allen@company.com', 'Customer Success', 'Support Engineer', 62000.00, '2022-07-18', 'active', 'Cardiff', '+44 29 2034 4544', 'Technical support escalations'),
    ('Noah', 'Young', 'noah.young@company.com', 'Engineering', 'ML Engineer', 102000.00, '2020-01-20', 'active', 'Cambridge', '+44 1223 464 646', 'Machine learning models'),
    ('Lily', 'King', 'lily.king@company.com', 'Design', 'Design Director', 96000.00, '2018-03-12', 'active', 'London', '+44 20 7946 0444', 'Design team leadership'),
    ('Alexander', 'Wright', 'alexander.wright@company.com', 'Engineering', 'Platform Engineer', 89000.00, '2021-05-03', 'on-leave', 'Oxford', '+44 1865 240 000', 'Kubernetes and containerization'),
    ('Sophia', 'Lopez', 'sophia.lopez@company.com', 'Finance', 'Accountant', 64000.00, '2022-09-14', 'active', 'London', '+44 20 7946 0666', 'Monthly financial reporting'),
    ('Benjamin', 'Hill', 'benjamin.hill@company.com', 'Sales', 'Business Development', 73000.00, '2020-07-22', 'active', 'London', '+44 20 7946 0999', 'Partnership development'),
    ('Ava', 'Scott', 'ava.scott@company.com', 'Marketing', 'Brand Manager', 71000.00, '2021-02-17', 'active', 'London', '+44 20 7946 0101', 'Brand strategy and positioning'),
    ('Lucas', 'Green', 'lucas.green@company.com', 'Engineering', 'Mobile Developer', 84000.00, '2022-06-08', 'active', 'Nottingham', '+44 115 941 3344', 'iOS and Android development');

-- Create an index on commonly filtered/sorted columns for better performance
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_last_name ON employees(last_name);
