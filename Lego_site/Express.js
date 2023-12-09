const express = require('express');
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// Define your routes and middleware
// ...

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
