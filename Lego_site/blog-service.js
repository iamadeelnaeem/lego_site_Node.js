const fs = require('fs').promises;

let posts = [];
let categories = [];

function initialize() {
  return Promise.all([
    fs.readFile('./data/posts.json', 'utf8')
      .then(data => {
        posts = JSON.parse(data);
      })
      .catch(error => {
        throw new Error('Unable to read posts file');
      }),
    fs.readFile('./data/categories.json', 'utf8')
      .then(data => {
        categories = JSON.parse(data);
      })
      .catch(error => {
        throw new Error('Unable to read categories file');
      })
  ]);
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject('No results returned');
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published === true);
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject('No results returned');
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('No results returned');
    }
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories
};
