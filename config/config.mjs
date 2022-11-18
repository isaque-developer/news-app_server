export default {

    connection: {

        port: 8080
    },

    database: {

        host: '127.0.0.1',
        name: 'database'
    },

    default_models: {

        news: [ 'title', 'category', 'synopsis', 'content', 'cover', 'images' ],
        users: [ 'username', 'password', 'type' ]
    },

    user: {

        session: {

            key: 'test',
            expire: 3600000
        },

        encrypt: {

            salt: 8
        }
    }
}