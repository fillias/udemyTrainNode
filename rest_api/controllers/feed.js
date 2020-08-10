const path = require('path');
const fs = require('fs');

const User = require('../models/user');

// validace formularu serverside
const {
    validationResult
} = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {

    // pagination
    const currentPage = req.query.page || 1;
    // posts per page
    const perPage = 2;
    // kolik mame v db postu?
    let totalItems;

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            // tady resime kolik vratime polozek - pagination
            return Post.find()
                // pokud je currentpage 1 tak neskipnu nic ( 0 * perPage )
                // pokud je currentpage jakakoliv (napr 2), 
                // skipnu vsechny ty dva itemy co byly na page 1 (1*2)
                .skip((currentPage - 1) * perPage)
                // a zde limitnu pocet items ktery vratim (2)
                .limit(perPage);
        })
        .then(posts => {
            // console.log(posts);
            res.status(200).json({
                message: 'fetch posts success',
                posts: posts,
                // na fe je taky logika pagination
                totalItems: totalItems
            });
        })

        .catch(err => {
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
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    console.log(req.file);
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    // req.file.path je cesta k souboru kterou nastavime v multeru
    // images/obrazek.jpg
    const imageUrl = req.file.path;



    const createdAt = new Date();

    // console.log(req.body);

    /* req.userId - userId pridavame do req v is-auth.js */
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });


    post.save()
        .then(result => {
            // status 201 succes resource was created

            /* chceme nove pridany post pridat do list of posts pro daneho uzivatele */
           return User.findById(req.userId);
        })
        .then(user => {

            /* user je prave zalogovany user */
            /*  tak mu pridame nove vytvoreny post */
            user.posts.push(post);
            creator = user;
            return user.save();
        })
        .then(result => {

            res.status(201).json({
                message: 'post created sucessfully',
                post: post,
                creator: {
                        name: creator.name,
                        _id: creator._id
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
            res.status(200).json({
                message: 'post fetched',
                post: post
            });

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;

    // tady je logika na FE takova, ze pokud nebyl nahran novy obrazek tak je v body image puvodni
    // req.body image
    // pokud je uploadnuty novy tak ho vytahnem z multeru req.file
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }


    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                error.statusCode = 403;
                const error = new Error('Not athorized');
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            // save na ten samy post ponecha jeho _id nezmemene 
            return post.save();
        })
        .then(result => {
            // postnem status 200 (201 je jen kdyz byl new resource vytvoren)
            res.status(200).json({
                message: 'Post updated!',
                post: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }


            if (post.creator.toString() !== req.userId) {
                error.statusCode = 403;
                const error = new Error('Not athorized');
                throw error;
            }
            
            // check logged in user

            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {
            /* kdyz smazeme post, je treba take updatnout referenci v user schema
               v user.posts[]         
             */
            return User.findById(req.userId);
        })
        .then(user => {
            /* mongoose metoda pull - smaze cast zaznamy */
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: "sucessfully deleted"
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};