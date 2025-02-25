const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const moment = require('moment');

// Only use livereload in development mode
if (process.env.NODE_ENV !== 'production') {
    const livereload = require('livereload');
    const connectLivereload = require('connect-livereload');
    
    // Create and start livereload server
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(__dirname);
    
    // Use livereload middleware
    app.use(connectLivereload());
}

// Frontend route
const FrontRouter = require('./routes/front');

// Set ejs template engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.locals.moment = moment;

// Database connection
const db = require('./config/keys').mongoProdURI;
mongoose
    .connect(db, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
    })
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(error => {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files from the 'public' directory
app.use(express.static('app/public'));

// Routes
app.use(FrontRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});