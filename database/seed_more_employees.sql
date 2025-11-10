-- Add additional employee data for testing DataGrid features
-- This script adds 70 more employees to reach 100+ total

INSERT INTO employees (first_name, last_name, email, department, position, salary, hire_date, status, location, phone, notes) VALUES
-- Engineering Team (20 more)
('Alice', 'Cooper', 'alice.cooper@company.com', 'Engineering', 'Senior Developer', 92000, '2019-05-12', 'active', 'London', '+44 20 7946 1001', 'Full-stack specialist'),
('Bob', 'Dylan', 'bob.dylan@company.com', 'Engineering', 'Backend Developer', 78000, '2021-02-20', 'active', 'Manchester', '+44 161 850 2001', 'Node.js expert'),
('Carol', 'King', 'carol.king@company.com', 'Engineering', 'Frontend Developer', 75000, '2022-08-15', 'active', 'Bristol', '+44 117 927 7001', 'React specialist'),
('Dennis', 'Hopper', 'dennis.hopper@company.com', 'Engineering', 'DevOps Engineer', 85000, '2020-11-03', 'active', 'Edinburgh', '+44 131 225 2001', 'Kubernetes admin'),
('Eve', 'Arnold', 'eve.arnold@company.com', 'Engineering', 'QA Lead', 80000, '2019-07-22', 'active', 'London', '+44 20 7946 1002', 'Test automation lead'),
('Frank', 'Sinatra', 'frank.sinatra@company.com', 'Engineering', 'Junior Developer', 55000, '2023-04-10', 'active', 'Leeds', '+44 113 243 2001', 'Graduate hire'),
('Grace', 'Kelly', 'grace.kelly@company.com', 'Engineering', 'Software Architect', 110000, '2018-01-15', 'active', 'London', '+44 20 7946 1003', 'System design expert'),
('Henry', 'Ford', 'henry.ford@company.com', 'Engineering', 'Backend Developer', 82000, '2020-09-08', 'active', 'Birmingham', '+44 121 234 5001', 'Python specialist'),
('Iris', 'Murdoch', 'iris.murdoch@company.com', 'Engineering', 'Data Engineer', 88000, '2021-06-14', 'active', 'Cambridge', '+44 1223 464 001', 'Big data pipelines'),
('Jack', 'London', 'jack.london@company.com', 'Engineering', 'Mobile Developer', 79000, '2022-03-25', 'active', 'London', '+44 20 7946 1004', 'iOS development'),
('Kate', 'Bush', 'kate.bush@company.com', 'Engineering', 'Frontend Developer', 76000, '2021-11-18', 'active', 'Brighton', '+44 1273 606 001', 'Vue.js specialist'),
('Leo', 'Tolstoy', 'leo.tolstoy@company.com', 'Engineering', 'Senior Developer', 94000, '2019-08-30', 'active', 'London', '+44 20 7946 1005', 'Microservices'),
('Mary', 'Shelley', 'mary.shelley@company.com', 'Engineering', 'QA Engineer', 72000, '2022-01-12', 'active', 'Oxford', '+44 1865 240 001', 'Manual testing'),
('Neil', 'Armstrong', 'neil.armstrong@company.com', 'Engineering', 'Tech Lead', 105000, '2017-12-05', 'active', 'London', '+44 20 7946 1006', 'Team management'),
('Olivia', 'Newton', 'olivia.newton@company.com', 'Engineering', 'Backend Developer', 81000, '2020-10-22', 'active', 'Liverpool', '+44 151 231 1002', 'Java specialist'),
('Paul', 'McCartney', 'paul.mccartney@company.com', 'Engineering', 'DevOps Engineer', 86000, '2021-04-08', 'active', 'Manchester', '+44 161 850 2002', 'CI/CD pipelines'),
('Quinn', 'Fabray', 'quinn.fabray@company.com', 'Engineering', 'Junior Developer', 58000, '2023-07-01', 'active', 'London', '+44 20 7946 1007', 'Learning TypeScript'),
('Rita', 'Hayworth', 'rita.hayworth@company.com', 'Engineering', 'Senior Developer', 93000, '2019-02-14', 'active', 'Cardiff', '+44 29 2034 4001', 'Cloud architecture'),
('Steve', 'Jobs', 'steve.jobs@company.com', 'Engineering', 'Principal Engineer', 125000, '2016-06-20', 'active', 'London', '+44 20 7946 1008', 'Technical strategy'),
('Tina', 'Turner', 'tina.turner@company.com', 'Engineering', 'Platform Engineer', 87000, '2020-05-17', 'active', 'Glasgow', '+44 141 221 9001', 'Infrastructure'),

-- Sales Team (15 more)
('Uma', 'Thurman', 'uma.thurman@company.com', 'Sales', 'Sales Executive', 68000, '2021-09-12', 'active', 'London', '+44 20 7946 2001', 'Enterprise sales'),
('Victor', 'Hugo', 'victor.hugo@company.com', 'Sales', 'Account Manager', 72000, '2020-11-25', 'active', 'Birmingham', '+44 121 234 5002', 'Key accounts'),
('Wendy', 'Williams', 'wendy.williams@company.com', 'Sales', 'Sales Representative', 58000, '2022-06-08', 'active', 'Manchester', '+44 161 850 2003', 'SMB focus'),
('Xavier', 'Naidoo', 'xavier.naidoo@company.com', 'Sales', 'Sales Manager', 85000, '2019-03-15', 'active', 'London', '+44 20 7946 2002', 'Team lead'),
('Yara', 'Shahidi', 'yara.shahidi@company.com', 'Sales', 'Account Executive', 70000, '2021-07-20', 'active', 'Leeds', '+44 113 243 2002', 'Mid-market'),
('Zach', 'Braff', 'zach.braff@company.com', 'Sales', 'Business Development', 75000, '2020-08-30', 'active', 'London', '+44 20 7946 2003', 'New markets'),
('Amy', 'Winehouse', 'amy.winehouse@company.com', 'Sales', 'Sales Executive', 67000, '2022-02-14', 'active', 'Bristol', '+44 117 927 7002', 'Channel sales'),
('Blake', 'Lively', 'blake.lively@company.com', 'Sales', 'Account Manager', 71000, '2021-10-05', 'active', 'Edinburgh', '+44 131 225 2002', 'Strategic accounts'),
('Cara', 'Delevingne', 'cara.delevingne@company.com', 'Sales', 'Sales Representative', 59000, '2023-01-18', 'active', 'London', '+44 20 7946 2004', 'Startup accounts'),
('Diego', 'Luna', 'diego.luna@company.com', 'Sales', 'Regional Manager', 95000, '2018-09-10', 'active', 'London', '+44 20 7946 2005', 'South region'),
('Ella', 'Fitzgerald', 'ella.fitzgerald@company.com', 'Sales', 'Sales Executive', 69000, '2021-05-22', 'active', 'Cambridge', '+44 1223 464 002', 'Education sector'),
('Felix', 'Baumgartner', 'felix.baumgartner@company.com', 'Sales', 'Account Executive', 73000, '2020-12-08', 'active', 'Oxford', '+44 1865 240 002', 'Healthcare'),
('Gina', 'Rodriguez', 'gina.rodriguez@company.com', 'Sales', 'Sales Manager', 87000, '2019-06-15', 'active', 'London', '+44 20 7946 2006', 'North region'),
('Hugo', 'Weaving', 'hugo.weaving@company.com', 'Sales', 'Business Development', 76000, '2021-03-28', 'active', 'Liverpool', '+44 151 231 1003', 'Partnerships'),
('Isla', 'Fisher', 'isla.fisher@company.com', 'Sales', 'Sales Representative', 61000, '2022-11-12', 'active', 'Manchester', '+44 161 850 2004', 'Retail sector'),

-- Marketing Team (10 more)
('Jake', 'Gyllenhaal', 'jake.gyllenhaal@company.com', 'Marketing', 'Content Strategist', 68000, '2021-04-15', 'active', 'London', '+44 20 7946 3001', 'Blog strategy'),
('Keira', 'Knightley', 'keira.knightley@company.com', 'Marketing', 'Social Media Manager', 64000, '2022-08-20', 'active', 'Brighton', '+44 1273 606 002', 'Community management'),
('Liam', 'Neeson', 'liam.neeson@company.com', 'Marketing', 'Brand Manager', 75000, '2020-02-10', 'active', 'London', '+44 20 7946 3002', 'Brand identity'),
('Maya', 'Angelou', 'maya.angelou@company.com', 'Marketing', 'Marketing Analyst', 66000, '2021-09-05', 'active', 'Birmingham', '+44 121 234 5003', 'Data analysis'),
('Natalie', 'Portman', 'natalie.portman@company.com', 'Marketing', 'Digital Marketing', 70000, '2020-11-18', 'active', 'London', '+44 20 7946 3003', 'PPC campaigns'),
('Owen', 'Wilson', 'owen.wilson@company.com', 'Marketing', 'Content Manager', 63000, '2022-05-22', 'active', 'Manchester', '+44 161 850 2005', 'Video content'),
('Penelope', 'Cruz', 'penelope.cruz@company.com', 'Marketing', 'Marketing Director', 98000, '2018-07-30', 'active', 'London', '+44 20 7946 3004', 'Strategy leadership'),
('Rami', 'Malek', 'rami.malek@company.com', 'Marketing', 'SEO Manager', 69000, '2021-06-12', 'active', 'Leeds', '+44 113 243 2003', 'Technical SEO'),
('Saoirse', 'Ronan', 'saoirse.ronan@company.com', 'Marketing', 'Marketing Coordinator', 56000, '2023-02-08', 'active', 'London', '+44 20 7946 3005', 'Campaign support'),
('Tom', 'Hanks', 'tom.hanks@company.com', 'Marketing', 'Product Marketing', 72000, '2020-10-14', 'active', 'Bristol', '+44 117 927 7003', 'Go-to-market'),

-- Design Team (8 more)
('Ursula', 'Burns', 'ursula.burns@company.com', 'Design', 'Senior UX Designer', 80000, '2019-11-20', 'active', 'London', '+44 20 7946 4001', 'User research'),
('Viggo', 'Mortensen', 'viggo.mortensen@company.com', 'Design', 'UI Designer', 71000, '2021-07-15', 'active', 'Edinburgh', '+44 131 225 2003', 'Interface design'),
('Winona', 'Ryder', 'winona.ryder@company.com', 'Design', 'Graphic Designer', 65000, '2022-03-08', 'active', 'London', '+44 20 7946 4002', 'Brand materials'),
('Xander', 'Berkeley', 'xander.berkeley@company.com', 'Design', 'Motion Designer', 73000, '2020-09-22', 'active', 'Brighton', '+44 1273 606 003', 'Animation'),
('Yvonne', 'Strahovski', 'yvonne.strahovski@company.com', 'Design', 'UX Researcher', 77000, '2021-01-10', 'active', 'London', '+44 20 7946 4003', 'Usability testing'),
('Zayn', 'Malik', 'zayn.malik@company.com', 'Design', 'Product Designer', 78000, '2020-06-18', 'active', 'Manchester', '+44 161 850 2006', 'Mobile apps'),
('Audrey', 'Hepburn', 'audrey.hepburn@company.com', 'Design', 'Creative Director', 105000, '2017-08-25', 'active', 'London', '+44 20 7946 4004', 'Design leadership'),
('Benedict', 'Cumberbatch', 'benedict.cumberbatch@company.com', 'Design', 'UI/UX Designer', 74000, '2021-12-03', 'active', 'Oxford', '+44 1865 240 003', 'Web design'),

-- Finance Team (7 more)
('Catherine', 'Zeta-Jones', 'catherine.zeta-jones@company.com', 'Finance', 'Senior Accountant', 72000, '2020-04-15', 'active', 'London', '+44 20 7946 5001', 'Financial reporting'),
('Denzel', 'Washington', 'denzel.washington@company.com', 'Finance', 'Financial Controller', 95000, '2018-10-20', 'active', 'London', '+44 20 7946 5002', 'Budget oversight'),
('Elizabeth', 'Taylor', 'elizabeth.taylor@company.com', 'Finance', 'Accountant', 66000, '2021-08-12', 'active', 'Birmingham', '+44 121 234 5004', 'Accounts payable'),
('Freddie', 'Mercury', 'freddie.mercury@company.com', 'Finance', 'Finance Analyst', 70000, '2022-02-28', 'active', 'London', '+44 20 7946 5003', 'Forecasting'),
('Gwyneth', 'Paltrow', 'gwyneth.paltrow@company.com', 'Finance', 'Payroll Manager', 68000, '2020-11-05', 'active', 'Manchester', '+44 161 850 2007', 'Payroll processing'),
('Harrison', 'Ford', 'harrison.ford@company.com', 'Finance', 'Tax Specialist', 74000, '2019-09-18', 'active', 'London', '+44 20 7946 5004', 'Tax compliance'),
('Idris', 'Elba', 'idris.elba@company.com', 'Finance', 'Finance Manager', 88000, '2020-05-22', 'active', 'London', '+44 20 7946 5005', 'Financial planning'),

-- HR Team (5 more)
('Jennifer', 'Lawrence', 'jennifer.lawrence@company.com', 'HR', 'HR Business Partner', 72000, '2020-07-15', 'active', 'London', '+44 20 7946 6001', 'Employee relations'),
('Kevin', 'Spacey', 'kevin.spacey@company.com', 'HR', 'Talent Acquisition', 68000, '2021-10-08', 'active', 'Birmingham', '+44 121 234 5005', 'Technical recruiting'),
('Lucy', 'Liu', 'lucy.liu@company.com', 'HR', 'HR Coordinator', 54000, '2023-03-12', 'active', 'London', '+44 20 7946 6002', 'Admin support'),
('Morgan', 'Freeman', 'morgan.freeman@company.com', 'HR', 'Learning & Development', 75000, '2019-12-20', 'active', 'London', '+44 20 7946 6003', 'Training programs'),
('Nicole', 'Kidman', 'nicole.kidman@company.com', 'HR', 'HR Director', 98000, '2018-05-10', 'active', 'London', '+44 20 7946 6004', 'HR strategy'),

-- Customer Success Team (5 more)
('Oscar', 'Isaac', 'oscar.isaac@company.com', 'Customer Success', 'Customer Success Manager', 65000, '2021-06-20', 'active', 'London', '+44 20 7946 7001', 'Enterprise clients'),
('Priyanka', 'Chopra', 'priyanka.chopra@company.com', 'Customer Success', 'Support Specialist', 56000, '2022-09-15', 'active', 'Manchester', '+44 161 850 2008', 'Technical support'),
('Quentin', 'Tarantino', 'quentin.tarantino@company.com', 'Customer Success', 'Customer Success Lead', 78000, '2019-11-08', 'active', 'London', '+44 20 7946 7002', 'Team leadership'),
('Rachel', 'Weisz', 'rachel.weisz@company.com', 'Customer Success', 'Support Engineer', 64000, '2021-04-25', 'active', 'Bristol', '+44 117 927 7004', 'Escalations'),
('Samuel', 'Jackson', 'samuel.jackson@company.com', 'Customer Success', 'Customer Success Manager', 67000, '2020-12-18', 'active', 'London', '+44 20 7946 7003', 'Mid-market accounts');
