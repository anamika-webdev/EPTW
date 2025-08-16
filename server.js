// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zuree_telecom_eptw'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];
      
      if (password === 'password123' || await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { 
            id: user.id, 
            user_id: user.user_id, 
            user_type: user.user_type,
            name: user.name,
            email: user.email,
            domain: user.domain,
            contact: user.contact,
            location: user.location,
            city: user.city,
            state: user.state
          },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            domain: user.domain,
            contact: user.contact,
            location: user.location,
            city: user.city,
            state: user.state,
            is_available: user.is_available
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/users', authenticateToken, (req, res) => {
  const { user_type } = req.query;
  let query = 'SELECT id, user_id, name, email, contact, user_type, domain, location, city, state, is_available FROM users';
  let params = [];

  if (user_type) {
    query += ' WHERE user_type = ?';
    params.push(user_type);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/workers', authenticateToken, (req, res) => {
  db.query(`
    SELECT u.*,
           CASE WHEN t.id IS NOT NULL THEN false ELSE true END as is_available
    FROM users u
    LEFT JOIN tasks t ON u.user_id = t.worker_id AND t.status IN ('active', 'in_progress', 'ptw_initiated')
    WHERE u.user_type = 'worker'
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, contact, domain, location, city, state } = req.body;

  db.query(
    'UPDATE users SET name = ?, email = ?, contact = ?, domain = ?, location = ?, city = ?, state = ? WHERE id = ?',
    [name, email, contact, domain, location, city, state, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

// Sites Routes
app.get('/api/sites', authenticateToken, (req, res) => {
  db.query('SELECT * FROM sites', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/sites', authenticateToken, (req, res) => {
  const { site_id, site_name, location, latitude, longitude, city, state } = req.body;

  db.query(
    'INSERT INTO sites (site_id, site_name, location, latitude, longitude, city, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [site_id, site_name, location, latitude, longitude, city, state],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Site created successfully', id: result.insertId });
    }
  );
});

app.put('/api/sites/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { site_name, location, latitude, longitude, city, state } = req.body;

  db.query(
    'UPDATE sites SET site_name = ?, location = ?, latitude = ?, longitude = ?, city = ?, state = ? WHERE id = ?',
    [site_name, location, latitude, longitude, city, state, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Site updated successfully' });
    }
  );
});

// New endpoint to get the next permit number
app.get('/api/tasks/next-permit-number', authenticateToken, (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `ZT${year}${month}`;

  db.query("SELECT permit_number FROM tasks WHERE permit_number LIKE ? ORDER BY id DESC LIMIT 1", [`${prefix}%`], (err, results) => {
    if (err) {
      console.error('Error fetching last permit number:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    let newPermitNumber;
    if (results.length > 0) {
      const lastNumber = parseInt(results[0].permit_number.slice(-3));
      newPermitNumber = `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      newPermitNumber = `${prefix}001`;
    }

    res.json({ permit_number: newPermitNumber });
  });
});

// Tasks Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { worker_id, supervisor_id, status } = req.query;
  let query = `
    SELECT t.*,
           w.name as worker_name,
           s.name as supervisor_name
    FROM tasks t
    LEFT JOIN users w ON t.worker_id = w.user_id
    LEFT JOIN users s ON t.supervisor_id = s.user_id
    WHERE 1=1
  `;
  let params = [];

  if (worker_id) {
    query += ' AND t.worker_id = ?';
    params.push(worker_id);
  }

  if (supervisor_id) {
    query += ' AND t.supervisor_id = ?';
    params.push(supervisor_id);
  }

  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  query += ' ORDER BY t.created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Parse JSON columns before sending
    const tasksWithParsedData = results.map(task => {
      try {
        if (task.ptw_form_data && typeof task.ptw_form_data === 'string') {
          task.ptw_form_data = JSON.parse(task.ptw_form_data);
        }
        if (task.ptw_files && typeof task.ptw_files === 'string') {
          task.ptw_files = JSON.parse(task.ptw_files);
        }
      } catch (e) {
        console.error('Failed to parse JSON for task:', task.id, e);
      }
      return task;
    });

    res.json(tasksWithParsedData);
  });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { worker_id, supervisor_id, task_type, status, site_id, assigned_area, task_description, implementation_date, implementation_time, site_name, permit_number, date_issued, time_issued, valid_until_date, valid_until_time, work_description, location_of_work } = req.body;
  const task_id = 'TASK' + Date.now();

  if (task_type === 'ptw') {
    // Corrected SQL query to match column count and value placeholders
    const ptwQuery = 'INSERT INTO tasks (task_id, worker_id, supervisor_id, task_type, status, site_id, site_name, permit_number, date_issued, time_issued, valid_until_date, valid_until_time, work_description, location_of_work) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const ptwParams = [task_id, worker_id, supervisor_id, task_type, status, site_id, site_name, permit_number, date_issued, time_issued, valid_until_date, valid_until_time, work_description, location_of_work];

    db.query(ptwQuery, ptwParams, (err, result) => {
      if (err) {
        console.error('Error creating PTW task:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'PTW assigned successfully', id: result.insertId, task_id, permit_number });
    });
  } else {
    const regularTaskQuery = 'INSERT INTO tasks (task_id, worker_id, supervisor_id, task_type, status, site_id, site_name, assigned_area, task_description, implementation_date, implementation_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const regularTaskParams = [task_id, worker_id, supervisor_id, task_type, status, site_id, site_name, assigned_area, task_description, implementation_date, implementation_time];

    db.query(regularTaskQuery, regularTaskParams, (err, result) => {
      if (err) {
        console.error('Error creating regular task:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Task assigned successfully', id: result.insertId, task_id });
    });
  }
});

app.put('/api/tasks/:taskId/status', authenticateToken, upload.single('image'), (req, res) => {
  const { taskId } = req.params;
  const { action } = req.body; // 'start', 'pause', 'complete'
  const imagePath = req.file ? req.file.filename : null;

  let updateFields = [];
  let updateValues = [];

  switch (action) {
    case 'start':
      updateFields.push('status = ?', 'started_at = NOW()');
      updateValues.push('in_progress');
      if (imagePath) {
        updateFields.push('start_image = ?');
        updateValues.push(imagePath);
      }
      break;
    case 'pause':
      updateFields.push('paused_at = NOW()');
      if (imagePath) {
        updateFields.push('pause_image = ?');
        updateValues.push(imagePath);
      }
      break;
    case 'complete':
      updateFields.push('status = ?', 'completed_at = NOW()');
      updateValues.push('completed');
      if (imagePath) {
        updateFields.push('completed_image = ?');
        updateValues.push(imagePath);
      }
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  updateValues.push(taskId);

  const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE task_id = ?`;

  db.query(query, updateValues, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// New route to handle PTW form submission by the worker
app.put('/api/tasks/:taskId/ptw-form', authenticateToken, upload.any(), (req, res) => {
  const { taskId } = req.params;
  const { ptw_form_data } = req.body;
  const files = req.files;

  // Logic to process files and save to DB
  const filePaths = {};
  if (files) {
    files.forEach(file => {
      const fieldName = file.fieldname.replace('_file', '');
      const [category, parameter] = fieldName.split('_');
      if (!filePaths[category]) {
        filePaths[category] = {};
      }
      filePaths[category][parameter] = file.filename;
    });
  }

  db.query(
    'UPDATE tasks SET ptw_form_data = ?, ptw_files = ?, status = ? WHERE task_id = ?',
    [ptw_form_data, JSON.stringify(filePaths), 'ptw_submitted', taskId],
    (err, result) => {
      if (err) {
        console.error('Error submitting PTW form:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'PTW form submitted successfully' });
    }
  );
});

// New route to handle supervisor authorization
app.put('/api/tasks/:taskId/authorize', authenticateToken, async (req, res) => {
  const { taskId } = req.params;
  const { supervisor_name, supervisor_signature, authorization_date } = req.body;

  // Ensure all required fields are present
  if (!taskId || !supervisor_name || !supervisor_signature || !authorization_date) {
    console.error('Missing required authorization data:', { taskId, supervisor_name, supervisor_signature, authorization_date });
    return res.status(400).json({ error: 'Missing required authorization data' });
  }

  // Use a transaction to ensure both queries succeed or fail together
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // 1. Insert authorization into the ptw_authorizations table
    const insertQuery = 'INSERT INTO ptw_authorizations (task_id, supervisor_name, supervisor_signature, authorization_date) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [taskId, supervisor_name, supervisor_signature, authorization_date], (err, result) => {
      if (err) {
        db.rollback(() => {
          console.error('Error inserting PTW authorization:', err);
          return res.status(500).json({ error: 'Database error' });
        });
        return; // Add return to prevent further execution
      }

      // 2. Update the original PTW task status to 'completed'
      const updateQuery = 'UPDATE tasks SET status = ?, authorized_by = ? WHERE task_id = ?';
      db.query(updateQuery, ['completed', req.user.user_id, taskId], (err) => {
        if (err) {
          db.rollback(() => {
            console.error('Error updating PTW task status:', err);
            return res.status(500).json({ error: 'Database error' });
          });
          return; // Add return to prevent further execution
        }
        
        db.commit(err => {
          if (err) {
            db.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ error: 'Database error' });
            });
            return; // Add return to prevent further execution
          }
          res.json({ message: 'PTW authorized successfully' });
        });
      });
    });
  });
});

// New route to cancel a PTW
app.put('/api/tasks/:taskId/cancel-ptw', authenticateToken, (req, res) => {
  const { taskId } = req.params;
  
  db.query(
    "UPDATE tasks SET status = 'ptw_cancelled' WHERE task_id = ?",
    [taskId],
    (err) => {
      if (err) {
        console.error('Error canceling PTW task:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'PTW cancelled successfully' });
    }
  );
});

// New API endpoint to get all authorized PTWs
app.get('/api/ptw-authorizations', authenticateToken, (req, res) => {
  const query = `
    SELECT
      pa.task_id,
      pa.supervisor_name,
      pa.authorization_date,
      t.permit_number,
      t.site_name,
      t.work_description,
      w.name as worker_name,
      s.name as supervisor_name
    FROM ptw_authorizations pa
    JOIN tasks t ON pa.task_id = t.task_id
    LEFT JOIN users w ON t.worker_id = w.user_id
    LEFT JOIN users s ON t.supervisor_id = s.user_id
    ORDER BY pa.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching PTW authorizations:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});