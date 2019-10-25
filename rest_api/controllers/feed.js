// validace formularu serverside
const {
    validationResult
} = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
           // console.log(posts);
            res.status(200).json({
                message: 'fetch posts success',
                posts: posts
            });
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

    // json je express metoda, vrati spravne hlavicky, zkonvertuje js object do json a posle
    // status 200 = success
    /*
    res.status(200).json({
        posts: [{
            _id: '123',
            title: 'titulek',
            content: 'first post',
            imageUrl: 'images/aa.png',
            creator: {
                name: 'filip'
            },
            createdAt: new Date()
        }]
    });
    */

}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors);

    if (!errors.isEmpty()) {
        // pokud mame chyby

        //global error handling
        const error = new Error('validation failed, incorect data');
        
        // custom metoda statusCode
        error.statusCode = 422;
        // jak vyhodime error, express vyzkoci z ty funkce a bude hledat next() error handling funkci
        // ktera je v app.js
        throw error;

        /*
        // bez global error handling
        res.status(422).json({ 
            message: 'validation failed, incorect data',
            errors: errors.array()
        });
        */
    }

    // create post in db
    const _id = req.body._id;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = 'image' || req.body.imageUrl;
    const creator = 'filip' || req.body.name;
    const createdAt = new Date();

    console.log(req.body);

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: creator
        }
    });


    post.save()
        .then(result => {
            // status 201 succes resource was created
            res.status(201).json({
                message: 'post created sucessfully',
                post: {
                   // _id: new Date().toISOString(),
                    
                    title: title,
                    content: content,
                    creator: {
                        name: creator
                    },
                    createdAt: createdAt
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }

            /* tady jsme v async - v promise a proto throw(error) nedosahne na dalsi middleware 
            a k musime predat error v next()
            */
            next(err);
        });


}


// fetching single post - po kliknuti na tlacitko view v FE aplikaci
exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if (!post) {
            // no post was found
            const error = new Error('could not find post');
            error.statusCode = 404; //not found

            // pokud vyhodim error v then bloku, presune se do catch bloku a tam je next()
            // proto mohu throw i zde v async
            throw error;
        }
       // console.log(post);
        res.status(200).json({message: 'post fetched', post: post});

    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });

}