const User = require('../models/user');
const bcrypt = require('bcryptjs');


module.exports = {
    // args je argument object ktery jsme definovali v schema v userInput: UserInputData
    // takze v args je userInput.email apod
    // createUser(args, req) {
    //     const email = args.userInput.email
    // }

    createUser: async function( { userInput }, req ) {
        const existingUser = await User.findOne({email: userInput.email});
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

        const createdUser = await user.save();

        /* tady vratime data do graphql 
        ._doc vrati vsechna user data ale bez vsech metadat co pridava mongoose
        */
        console.log(...createdUser._doc);
        console.log('=========');
        console.log(createdUser);

        return { ...createdUser._doc, _id: createdUser._id.toString() }

    },



    hello() {
        return {
            text: 'Hello World',
            views: 1234
        }
    }
}