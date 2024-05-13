var express = require('express');
var router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Token is not valid

    req.user = user; // Set the user object in req.user
    next();
  });
};
// Authentication Routes

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are provided and are strings
  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).send('Username and password are required and must be strings');
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db('users').insert({ username, password: hashedPassword });
      res.status(201).json({ message: "User created successfully" });
  } catch (error) {
      console.error('Signup error', error);
      res.status(500).json({ message: 'Error during signup' });
  }
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const results = await db('users').select('id', 'username', 'password').where('username', username);
      if (results.length === 0) {
          return res.status(401).json('Username or password incorrect');
      }
      const user = results[0]; // Safely access the first result

      if (await bcrypt.compare(password, user.password)) {
          // User authenticated, create JWT
          const token = jwt.sign(
              { id: user.id, username: user.username },
              process.env.SECRET_KEY, // Ensure you have a SECRET_KEY in your environment variables
              { expiresIn: '24h' }  // Token expires in 24 hours
          );
          res.json({ accessToken: token });  // Send token to client
      } else {
          res.status(401).send("Password incorrect");
      }
  } catch (error) {
      console.error('Login error', error);
      res.status(500).json('Error during login');
  }
});


router.post('/tasks', authenticateToken, async (req, res) => {
  // Destructure the necessary attributes from the request body
  const { title, description, priority, category, status, due_date } = req.body;

  // Check if user object and user id exists in the request object
  if (!req.user || !req.user.id) {
    console.error('Authentication failed: No user ID available');
    return res.status(401).json("User authentication failed.");
  }

 
  try {
    // Execute the query with the values
    const result = await db('tasks').insert({
      user_id: req.user.id,
      title,
      description,
      priority,
      category,
      status,
      due_date
    });
    console.log("Task created successfully:", result);
    res.status(201).json({
      id: result.insertId, 
      title, 
      description, 
      priority, 
      category, 
      status, 
      due_date
    });
  } catch (err) {
    console.error('Error on server:', err);
    res.status(500).json('Error creating the task.');
  }
});


router.get('/tasks', authenticateToken, async (req, res) => {
  console.log("Fetching tasks for user ID:", req.user.id);  // Log user ID
  if (!req.user || !req.user.id) {
    console.error('Authentication failed: No user ID available');
    return res.status(401).send("Authentication required.");
  }

  try {
      const results = await db('tasks').select('*').where('user_id', req.user.id);
      console.log("SQL Query executed:", results.toString());  // Log the query
      if (results.length > 0) {
          console.log('Tasks fetched successfully:', results);
          res.status(200).json(results);
      } else {
          console.log('No tasks found for the user:', req.user.id);
          res.status(404).send('No tasks found.');
      }
  } catch (err) {
      console.error('Error on server:', err);
      res.status(500).send('Error on the server.');
  }
});

router.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { title, description, priority, category, status, due_date } = req.body;
  try {
    const updateCount = await db('tasks').where({ id: req.params.id, user_id: req.user.id }).update({
      title,
      description,
      priority,
      category,
      status,
      due_date
    });
    if (updateCount === 0) {
      return res.status(404).send('Task not found.');
    }
    res.send('Task updated successfully');
  } catch (err) {
    console.error('Error on server:', err);
    res.status(500).send('Error on the server.');
  }
});


router.delete('/tasks/:id', authenticateToken, async (req, res) => {
  await db('tasks').where({ id: req.params.id, user_id: req.user.id }).del()
  .then(result => {
    if (result.affectedRows == 0) return res.status(404).send('Task not found.');
    res.send('Task deleted successfully');
  })
  .catch(err => {
    console.error('Error on server:', err);
    res.status(500).send('Error on the server.');
  });
});

module.exports = router;