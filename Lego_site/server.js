/*********************************************************************************
*  BTI325 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
*
*  Name: Aria Shakibai    Student ID: 112070164  Date: 
*
*  Online (Cyclic) URL: https://kind-lion-jacket.cyclic.app
*
********************************************************************************/

// Organized imports
const express = require('express');
const path = require('path');
const legoData = require('./modules/legosets');
const axios = require('axios'); // Import axios for making HTTP requests
const ejs = require('ejs');

const app = express();
const PORT = 3001;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Middleware for parsing form data

// Separated route handling
const renderHomePage = (req, res) => {
  res.render('home'); 
};

const renderAboutPage = (req, res) => {
  res.render('about'); 
};

const fetchLegoSets = async (req, res) => {
  try {
    const { theme } = req.query;
    const result = theme ? await legoData.getSetsbyTheme(theme) : await legoData.getAllSets();
    res.render('sets', { legoSets: result });
  } catch (err) {
    res.status(404).send(err);
  }
};

const fetchLegoSetByNum = async (req, res) => {
  try {
    const { setNum } = req.params;
    const set = await legoData.getSetByNum(setNum);
    const response = await axios.get('https://api.quotable.io/random');
    const randomQuote = response.data;

    res.render('setDetails', { quote: randomQuote.content ,set: set });

  } catch (err) {
    res.status(404).send(err);
  }
};

const renderAddSetPage = async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (error) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
};

const handleAddSetSubmission = async (req, res) => {
  try {
    const setData = req.body;
    await legoData.addSet(setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
};

const handleNotFound = (req, res) => {
  res.status(404).render('404', { message: "Sorry, the page you are looking for doesn't exist. You might want to check the URL or go back to the homepage." });
};

const randerEditSetPage= async (req, res) => {
  try {
    const { setNum } = req.params;
    const [set, themes] = await Promise.all([
      legoData.getSetByNum(setNum),
      legoData.getAllThemes()
    ]);

    res.render('editSet', { themes, set }); 
  } catch (err) {
    res.status(500).render('500', { message: `Internal Server Error: ${err}` });
  }
};

const handleEditSetSubmission= async (req, res) => {
  try {
    const { set_num, ...setData } = req.body;
    await legoData.editSet(set_num, setData);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
};

const handleDeleteSet= async (req, res) => {
  try {
    const { setNum } = req.params;
    await legoData.deleteSet(setNum);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
};


// Routes
app.get('/', renderHomePage);
app.get('/about', renderAboutPage);
app.get('/lego/sets', fetchLegoSets);
app.get('/lego/sets/:setNum', fetchLegoSetByNum);
app.get('/lego/addSet', renderAddSetPage);
app.post('/lego/addSet', handleAddSetSubmission);
app.get('/lego/editSet/:setNum', randerEditSetPage);
app.post('/lego/editSet/:setNum', handleEditSetSubmission);
app.get('/lego/deleteSet/:setNum',handleDeleteSet);
app.use(handleNotFound);
app.set('view engine', 'ejs');

// Server initialization
const startServer = async () => {
  await legoData.initialize();
  app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}...`);
  });
};

startServer();
