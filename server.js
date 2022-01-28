//LIBRERIAS
var express = require("express");
var net = require("net");
var mysql = require("mysql");
//CONSTANTES
HOST = '127.0.0.1'
PORT = 6666


// DATABASE CONNECTION
var connMySQL = mysql.createConnection({
    host: HOST,
    user: "root",
    password: "toor",
    database: 'development'
});
//CREATE A DB TABLE
connMySQL.connect(function(err) {
    if (err) throw err;
    console.log("[DB LOG] BASE DE DATOS CONECTADA");
    var sql = "CREATE TABLE pesaje (id INT AUTO_INCREMENT PRIMARY KEY, folio INT DEFAULT 0, p_inicial FLOAT DEFAULT 0, neto FLOAT DEFAULT 0, tara FLOAT DEFAULT 0, path_image VARCHAR(255))";
    connMySQL.query(sql, function (err, result){
        if (err) {
            console.log("[DB LOG] LA TABLA YA EXISTE");
        }
    });
    console.log("[DB LOG] TABLA CREADA");
});



// EXPRESS SERVER
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var server = app.listen(8080, function(){
    console.log("[ EXPRESS SERVER LOG ] APP LISTENING")
})

// READ DB ALL VALUES
app.get('/reporte', (req,res) => {
    connMySQL.query("SELECT * FROM pesaje", function (err, result, fields) {
        if (!err){
            console.log(result);
            res.json( { datos: result} );
        }else{
            console.log(err)
        }
    });
});

// READ DB UNIQUE VALUE
app.get('/reporte/:reporteId', (req,res) => {
    sqlCommand = "SELECT * FROM pesaje WHERE id = " + mysql.escape(req.params.reporteId);
    connMySQL.query(sqlCommand, function (err, result){
        if(err) throw err;
        console.log("[DB LOG] DB DATA: ", result);
        res.json( {reporte: result} );
    });
});


//FLATA CORREGIR EL ERROR EN COUNT PARA EL FOLIO
function readCountDB(){
    let folio_str = 0;
    sqlCommand = "SELECT COUNT(*) as count FROM pesaje";
    connMySQL.query(sqlCommand, function(err, result,){
        if(err) throw err;
        folio_str = JSON.parse(JSON.stringify(result));
        folio_str = folio_str[0].count;
        console.log(folio_str)
    });
    return folio_str;
}
// WRITE NEW VALUE DB
// CODIGOS
// 100 DONE
// 101 ERROR RECEPCION
app.post('/reporte/nuevo/inicial', (req,res) => {
    let folio = (readCountDB() + 1);
    console.log(folio)
    console.log("[DB LOG] DATA NUEVO REPORTE: ", req.body);
    sqlCommand = "INSERT INTO pesaje (folio, p_inicial) VALUES (" + folio + "," + req.body.p_inicial + ")";
    connMySQL.query(sqlCommand, function (err, result) {
        if(err) throw err;
        console.log("[DB LOG] ANADIENDO VALORES INICIALES");
        res.json({
            "code": 100,
            "data": {
                "folio":folio,
                "p_inicial":req.body.p_inicial
            }
        });
    });
});
// ETHERNET SCALE SERVER
var server = net.createServer(function(socket){
    console.log("[SERVER LOG - ] SERVIDOR INICIALIZADO");
    socket.pipe(socket);
});

server.listen(PORT, HOST);

server.on('connection', function(socket) {
    console.log('[SERVER LOG - ] NUEVA CONEXION ENTRANTE');

    // The server can also receive data from the client by reading from its socket.
    var dataOut = "";
    socket.on('data', function(data) {
        data = data.toString()
        console.log("[SERVER LOG - ] ", data);
        dataOut = data.toString();
        if(dataOut.substring(0,1) == '1'){
            app.get('/bascula1', (req, res) => {
                res.json( {peso: dataOut} )
            });
        }
        if(dataOut.substring(0,1) == '2'){
            app.get('/bascula2', (req, res) => {
                res.json( {peso: dataOut} )
            });
        }
    });
    
    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('[SERVER LOG - ] SE CERRO LA CONEXION');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`[SERVER LOG - ] Error: ${err}`);
        if(err === "ECONNRESET"){
            console.log("[ SERVER LOG ] SE PERDIO LA CONEXION")
        }
    });
});