'use strict'

export default ( models, model, mongoose ) => {

    Object.keys( models ).forEach( name => model.createModel( mongoose, name, models[ name ].reduce(

        ( obj, key ) => {
            
            obj [ key ] = { type: key == 'images' ? [] : String, required: key == 'cover' ? false : true }
            return obj
        }, {}))
    )
}