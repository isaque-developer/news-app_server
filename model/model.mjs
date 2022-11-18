import bcrypt from 'bcryptjs'
import config from '../config/config.mjs'
import { authorization, verifyAuth } from './session.mjs'

const models = {}

export default class {

    static async create( model, data, by ) {

        const created = await new Promise( res => {

            model.create( data, e => res( e ? false : true ))
        })

        return by == 'user' ? created : this.result({

            data: created,
            msg: 'Falha ao cadastrar.'
        }, `create${ by ? `-${ by }` : '' }` )
    }
    
    static createModel({ model, Schema }, collection, schema ) {

        let newModel

        try {

            newModel = model( collection, new Schema( schema, { timestamps: true }))

        } finally {

            newModel && ( models[ collection ] = newModel )

            return this.result({

                data: newModel && models[ collection ],
                msg: 'Falha ao criar modelo.'
            }, 'create-model' )
        }
    }

    static async createUser( model, data ) {

        if( await this.find( model, [{ username: data.username }, '_id', { limit: 1 }, 'create-user' ])) {

            const user = { ...data }
            user.password = await bcrypt.hash( data.password, config.user.encrypt.salt )
            return await this.create( model, user, 'user' )
                ? this.login( model, data )
                : this.result({ data: null, msg: 'Erro ao criar usuário.' }, 'create-user' )
        }

        return this.result({

            data: null,
            msg: 'Já possuí usuário com este nome.' }, 'create-user' )
    }
    
    static async delete( model, id ) {

        return this.result({

            data: await new Promise( res => {

                model.findByIdAndDelete( id, e => res( e ? false : true ))
            }),
            msg: 'Falha ao remover.'
        }, 'delete' )
    }

    static async find( model, [ search, fields, options, by ]) {

        const found = await new Promise( res => {

            model.find( search, fields, options, ( e, f ) => res( e ? null : f ))
        })

        return by == 'create-user' ? !found.length : this.result({

            data: found,
            msg: 'Sem resultado.'
        }, `find${ by ? `-${ by }` : '' }` )
    }

    static async findById( model, data ) {

        return this.result({

            data: await new Promise( res => {

                model.findById( data, ( e, f ) => res( e ? null : f ))
            }),
            msg: 'Pesquisa sem resultado.'
        }, 'find-id' )
    }

    static async login( model, { username, password }) {

        const user = await new Promise( res => {

            model.find({ username }, ( e, u ) => res( e || u.length != 1 ? null : u[0] ))
        })

        return this.result(

            user ? ( await bcrypt.compare( password, user.password ) ? {

                    data: await authorization( config.user, user._id.toString()),
                    msg: 'Login efetuado com sucesso!'
                } : {

                    data: null,
                    msg: 'Senha inválida.'
                }
            ) : {

                data: null,
                msg: 'Usuário não encontrado.'
            }, 'login' )
    }

    static result({ data, msg }, type ) {

        console.log(`[${ type }]`)
        return JSON.stringify({

            error: data ? false : true,
            type,
            response: data || msg || 'Falha ao executar. Tente novamente mais tarde.'
        })
    }

    static async update( model, { filter: _id, replace }) {

        return this.result({

            data: await new Promise( res => {

                model.updateOne({ _id }, replace, e => res( e ? false : true ))
            }),
            msg: 'Falha ao atualizar.'
        }, 'update' )
    }
    
    static verifySorting( mongoose, { type, model, data, auth }) {

        if( !( type.indexOf('find') >= 0 || model == 'users' ) && ( !auth || verifyAuth( auth ).error ))

            return this.result({ data: null, msg: 'Necessário estar autenticado.' }, type )

        if( type != 'create-model' && !models[ model ] )

            return this.result({ data: null, msg: 'Modelo inválido selecionado.' }, type )

        switch( type ) {

            case 'create':

                return model == 'users'
                    ? this.createUser( models[ model ], data )
                    : this.create( models[ model ], data )

            case 'create-model':

                return models[ model ]
                    ? this.result({ data: null, msg: 'Nome do modelo já utilizado.' }, type )
                    : this.createModel( mongoose, model, data )

            case 'delete':

                return this.delete( models[ model ], data )

            case 'find':

                return this.find( models[ model ], data )

            case 'find-id':

                return this.findById( models[ model ], data )

            case 'login':

                return this.login( models[ model ], data )

            case 'update':

                return this.update( models[ model ], data )

            default:

                return this.result({ data: null, msg: 'Tipo inválido requisitado.' }, type )
        }
    }
}