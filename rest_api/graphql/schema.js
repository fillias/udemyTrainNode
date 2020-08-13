const { buildSchema } = require('graphql');


module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    type TestData {
         text: String!
         views: Int!
    }

    type RootQuery {
        hello: TestData!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);

/* vyexportujem buildschema object ktery nam vygeneruje buildSchema funkce
jako argument je string kde popiseme nase schema

    // type [jmeno] definujeme type querin ktere povolujeme
    type RootQuery {
        // muzeme poslat 'hello' query a dostat zpet nejaky string ( ! je required) ktery definujeme v resolvers.js
        hello: String!
    }

    schema {
        // v query definujeme povolene queriny
         query: RootQuery
    }

 */
// module.exports = buildSchema(`
//     type TestData {
//         text: String!
//         views: Int!
//     }

//     type RootQuery {
//         hello: TestData!
//     }

//     schema {
//         query: RootQuery
//     }
// `);