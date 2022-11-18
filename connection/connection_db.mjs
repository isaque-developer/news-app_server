export default ( connect, { host, name } ) => {

    return connect( `mongodb://${ host }/${ name }`, {
        
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}