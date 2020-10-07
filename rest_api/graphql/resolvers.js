const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const clearImage = require('../util/file');


module.exports = {
    // args je argument object ktery jsme definovali v schema v userInput: UserInputData
    // takze v args je userInput.email apod
    // createUser(args, req) {
    //     const email = args.userInput.email
    // }

    createUser: async function( { userInput }, req ) {
        console.log('zkousim create user');

        /* ukazka validace s validatorem */
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({message: 'invalid email'});
        }

        if (validator.isEmpty(userInput.password)) {
            errors.push({message: 'chybi heslo'});
        }

        if (errors.length > 0) {
            const error = new Error('spatny input');
            /* error.data pak bude v app.js v graphql v originalError.data */
            error.data = errors;
            error.code = 422;
            throw errors;
        }


        const existingUser = await User.findOne({email: userInput.email});
        console.log(existingUser);
        if (existingUser) {
            const error = new Error('user exist already');
            throw error;
        }

        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPw
        });

        /* createdUser bude object ktery save() vytvorilo v db */
        const createdUser = await user.save();

        /* tady vratime data do graphql 
        ._doc vrati vsechna user data ale bez vsech metadat co pridava mongoose
        */
        // console.log(...createdUser._doc);
        console.log('=========');
        console.log(createdUser);

        /*  */
        return { ...createdUser._doc, _id: createdUser._id.toString() }

    },

    login: async function ( {email, password} ) {
        const user = await User.findOne({email: email});

        if (!user) {
            const error = new Error('email neexistuje');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password); 

        if (!isEqual) {
                const error = new Error('heslo nesouhlasi');
                error.code = 401;
                throw error;
        }

        const token = jwt.sign({
                email: user.email,
                userId: user._id.toString() // _id je mongodb ID proto toString()
        }, 'necoDesneTajnyho', { expiresIn: '1h' });

        return { token: token, userId: user._id.toString() };

    },

    createPost: async function( { postInput }, req ) {

        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 401;
            throw error;
        }

        // console.log(postInput);
        const errors = [];
        if (validator.isEmpty(postInput.title)) {
            errors.push({message: 'chybi title'});
        }

        if (errors.length > 0) {
            const error = new Error('spatny postInput');
            /* error.data pak bude v app.js v graphql v originalError.data */
            error.data = errors;
            error.code = 422;
            throw errors;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('invalid user');
            error.code = 401;
            throw error;
        }

        const post = new Post();
        post.title = postInput.title;
        post.content = postInput.content;
        post.imageUrl = postInput.imageUrl;
        post.creator = user;

        const createdPost = await post.save();

        user.posts.push(createdPost);
        
        const updatedUser = await user.save();

        if (!updatedUser) {
            const error = new Error('chyba zapisovani post do user');
            error.code = 401;
            throw error;
        }
        // console.log({...createdPost._doc});

        return {
            ...createdPost._doc, 
            _id:createdPost._id.toString(), 
            createdAt: createdPost.createdAt.toISOString(), 
            updatedAt: createdPost.updatedAt.toISOString()
            };


    },

    posts: async function({page}, req) {

        console.log('load posts');

        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 401;
            throw error;
        }

        if (!page) {
            page = 1;
        }

        const perPage = 2;


        const totalPosts = await Post.find().countDocuments();

        // najdi posty a sortni je jako descending order
        // a populate 'creator' to fetch all user data
        const posts = await Post.find()
            .sort({createdAt: -1})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('creator');

        // console.log(req);
        /* 
        nemuzeme jen return {posts: posts, totalPost: totalPost};
        protoze tam budou ty mongoose udaje a _id ktery graphql nebude rozumet, tak to upravime (map)
         */
        return {posts: posts.map(post => {
            // console.log({...post._doc});
            return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
            };
        }), totalPosts: totalPosts};

    },

    post: async function({id}, req) {

        console.log('single post'); 
        // if (!req.isAuth) {
        //     const error = new Error('not authenticated');
        //     error.code = 401;
        //     throw error;
        // }

        const post = await Post.findById(id).populate('creator');

        if (!post) {
            const error = new Error('post - nenasel jsem post');
            error.code = 404;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },

    updatePost: async function ({id, postInput}, req) {

        console.log('update post');

        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');

        if (!post) {
            const error = new Error('post - nenasel jsem post');
            error.code = 404;
            throw error;
        }


        if (post.creator._id.toString() != req.userId.toString()) {
            const error = new Error('chybny user pri update post');
            error.code = 403;
            throw error;
        }


        const errors = [];
        if (validator.isEmpty(postInput.title)) {
            errors.push({message: 'chybi title'});
        }

        if (errors.length > 0) {
            const error = new Error('spatny postInput v edit');
            /* error.data pak bude v app.js v graphql v originalError.data */
            error.data = errors;
            error.code = 422;
            throw errors;
        }

        post.title = postInput.title;
        post.content = postInput.content;

        if (postInput.imageUrl != 'undefined') {
            post.imageUrl = postInput.imageUrl;
        }
        

        const updatedPost = await post.save();



        return {
            ...updatedPost._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };

    },

    deletePost: async function ({id}, req) {

        console.log('delete post');

        if (!req.isAuth) {
            const error = new Error('not authenticated');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');

        if (!post) {
            const error = new Error('post - nenasel jsem post');
            error.code = 404;
            throw error;
        }


        if (post.creator._id.toString() != req.userId.toString()) {
            const error = new Error('chybny user pri delete post');
            error.code = 403;
            throw error;
        }

        // clearImage(post.imageUrl);

        //  await post.findByIdAndRemove(id);

        console.log(post.imageUrl);

        return true;

    }

}


