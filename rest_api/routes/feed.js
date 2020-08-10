// validace formularu serverside
const { body } = require('express-validator');


const express = require('express');

const router = express.Router();

const feedController = require('../controllers/feed');

/* u kazde routy zjistime jestli je auhenticated */
const isAuth = require('../middleware/is-auth');

// GET  /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST  /feed/posts  create new post
// use middleware express-validator jako array of middlewares
router.post('/post', isAuth, [
    body('title').trim().isLength({min: 2}),
    body('content').trim().isLength({min: 2}),
], feedController.createPost);

// fetch single post
// route for single post s dynamickym parametrem, chceme encodovat id do url
// - po kliknuti na tlacitko view v FE aplikaci
router.get('/post/:postId', feedController.getPost);


// update post
router.put(
    '/post/:postId', isAuth,
    [
      body('title')
        .trim()
        .isLength({ min: 2 }),
      body('content')
        .trim()
        .isLength({ min: 2 })
    ],
    feedController.updatePost
  );



// delete post
router.delete('/post/:postId', isAuth, feedController.deletePost);


module.exports = router;