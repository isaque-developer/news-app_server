'use strict'

import mongoose from 'mongoose'
import { WebSocketServer } from 'ws'

import config from './config/config.mjs'
import connect_db from './connection/connection_db.mjs'
import connect_ws from './connection/connection_ws.mjs'
import create_default from './default/create_default_models.mjs'
import model from './model/model.mjs'

( async ({ connection, database, default_models }) => {

    try {

        await connect_db( mongoose.connect, database )
        create_default( default_models, model, mongoose )
        connect_ws( new WebSocketServer( connection ), model, mongoose )

    } catch ( error ) {

        console.error( error )
    }

})( config )