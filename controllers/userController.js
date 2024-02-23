// llamar a la conexión 
const sql = require('../connection.js')


const userController = {
  'login': function (req, res) {

  },
  'createUser': async function (req, res) {

    const send = {}
    const usuario = req.body.usuario,
      provincia = req.body.provincia,
      password = req.body.password;

    const test = await sql`SELECT * FROM usuarios WHERE usuario = ${usuario}`
    if (test.length >= 1) {
      send.errors = []
      const err = {
        "status": 409,
        "title": "Conflict",
        "message": "Email en uso. Utilice otro"
      }
      send.errors.push(err)
      res.send(send)
    } else {
      await sql`SELECT createUser(${usuario}, ${provincia}, ${password})`
      send.data = {
        "message": 'Usuario registrado'
      }
      res.send(send)
    }

  },
  'getFavs': async function (req, res) {
    const send = {}
    var userId = req.params.id
    const test = await sql `SELECT checkUserById(${userId})`
    const data = await sql`SELECT * FROM getFavs(${userId})`


    if (test.length === 0) {
      send.errors = []
      const err = {
        "status": 404,
        "title": "Not Found",
        "message": "El usuario no existe"
      }
      send.errors.push(err)
      res.send(send)
    }
    else if (data.length === 0) {
      send.errors = []
      const err = {
        "status": 404,
        "title": "Not Found",
        "message": "El usuario no tiene favoritos"
      }
      send.errors.push(err)
      res.send(send)
    }
    else {
      send.data = data
      res.send(send)
    }
  },
  'setFav': async function (req, res) {
    const send = {}
    var id_usuario = req.body.id_usuario
    var id_especie = req.body.id_especie
    const userTest = await sql `SELECT checkUserById(${id_usuario})`
    const plantTest = await sql `SELECT * FROM getById(${id_especie})`
    
    if (userTest.length === 0) {
      send.errors = []
      const err = {
        "status": 404,
        "title": "Not found",
        "message": "El usuario no existe"
      }
      send.errors.push(err)
      res.send(send)
    }
    else if (plantTest.length === 0) {
      send.errors = []
      const err = {
        "status": 404,
        "title": "Not found",
        "message": "La planta ingresada no existe"
      }
      send.errors.push(err)
      res.send(send)
    }
    else {
      try{
        await sql `SELECT setFav(${id_usuario},${id_especie})`    
        send.data = {
        "status": 200,
        "title": "Transaction OK",
        "message": 'Favorito agregado'
        }
        res.send(send)
      }
      catch{
      send.errors = []
      const err = {
        "status": 409,
        "title": "Conflict",
        "message": "La planta ya esta agregada en el listado de favoritos del usuario"
      }
      send.errors.push(err)
      res.send(send)
      }
    }    
  },  
  
  'updateUser': function (req, res) {

  },

  /*  Elimina un usuario pasado dentro del elemento del body "id_usuario" y activa un trigger 
      que elimina previamente todos sus favoritos */
  'deleteUser': async function (req, res) {
    const send = {}
    var id_usuario = req.body.id_usuario
    const userTest = await sql `SELECT checkUserById(${id_usuario})`
    
    if (userTest.length === 0) {
      send.errors = []
      const err = {
        "status": 404,
        "title": "Not found",
        "message": "El usuario no existe"
      }
      send.errors.push(err)
      res.send(send)
    }
    else {
      try{
        await sql `SELECT deleteUser(${id_usuario})`    
        send.data = {
        "status": 200,
        "title": "Transaction OK",
        "message": 'Usuario correctamente eliminado'
        }
        res.send(send)
      }
      catch{
      send.errors = []
      const err = {
        "status": 500,
        "title": "Internal error",
        "message": "Error del servidor, contáctese con el administrador"
      }
      send.errors.push(err)
      res.send(send)
      }
    }    
  }
}


module.exports = userController;


/*updateUser(id_usuario_[int], usuario [string] (optional), provincia [string] (optional), password [string] (optional))
En base a un id_usuario, se puede modificar opcionalmente cualquier registro del mismo (dejar NULL en los espacios que no se quiera modificar nada) */