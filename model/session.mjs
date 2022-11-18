import bcrypt from 'bcryptjs'

const sessions = {}

export const { authorization, verifyAuth } = {

    authorization: async ({ session: { key, expire }, encrypt: { salt }}, user ) => {

        const create = new Date().getTime()
        const authHash = await bcrypt.hash( `${ key } ${ create } ${ user }`, salt )

        sessions[ authHash ] = {

            user,
            create,
            expire: create + expire
        }

        return authHash
    },

    verifyAuth: ( authHash ) => {

        if ( sessions[ authHash ] ) {
                
            const timestamp = new Date().getTime()

            if ( sessions[ authHash ][ 'expire' ] > timestamp ) {
                
                return {
            
                    error: false,
                    user: sessions[ authHash ][ 'user' ]
                }

            } else {
                
                delete sessions[ authHash ]

                return {
            
                    error: true,
                    msg: 'Sua sessão expirou. Favor efetuar o login novamente!'
                }
            }
        }
        return {
            
            error: true,
            msg: 'Sessão não encontrada!'
        }
    }
}