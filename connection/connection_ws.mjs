export default ( ws, model, mongoose ) => {

    ws.on( 'connection', client => {

        client.on( 'message', async received => {

            try {

                const data = JSON.parse( received )
                client.send( await model.verifySorting( mongoose, data ))

            } catch ( e ) {

                client.send( model.result({ msg: 'Requisição inválida.' }))
            }
        })
    })
}