// validace formularu serverside
const { body } = require('express-validator');


const express = require('express');

const router = express.Router();

const feedController = require('../controllers/feed');


// GET  /feed/posts
router.get('/posts', feedController.getPosts);

// POST  /feed/posts  create new post
// use middleware express-validator jako array of middlewares
router.post('/posts', [
    body('title').trim().isLength({min: 2}),
    body('content').trim().isLength({min: 2}),
], feedController.createPost);

// fetch single post
// route for single post s dynamickym parametrem, chceme encodovat id do url
// - po kliknuti na tlacitko view v FE aplikaci
router.get('/post/:postId', feedController.getPost);


module.exports = router;