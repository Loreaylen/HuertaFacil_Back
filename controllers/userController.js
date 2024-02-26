// llamar a la conexión 
const sql = require('../connection.js')
const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/token')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const userController = {
  'login': async function (req, res) {
    const usuario = req.body.usuario
    const password = req.body.password
    const send = {}

    try {
      const data = await sql `SELECT * FROM usuarios WHERE usuario = ${usuario}`

    if(data.length === 0){
      send.errors = [{status: "409", title: "Conflict", message: 'El usuario no existe' }]
      res.send(send)
    } else {
      const user = data[0]

      if(bcrypt.compareSync(password, user.pass)){
        const token = generateToken(user)
        send.data = {type: 'response', attributes: {status: "200", title: "Transaction OK", message: 'Sesión iniciada', token: token}}
        res.cookie('jwt', token)
      }
      else { 
        send.errors = [{status: "409", title: "Conflict", message: 'Contraseña incorrecta' }]
      }
      res.send(send)
    }
    } catch {
      res.status(500).send({errors: [
        {
          "status": 500,
          "title": "Internal error",
          "message": "Error del servidor, contáctese con el administrador"
        }]
      })
    }
    
  },
  'createUser': async function (req, res) {

    const email = req.body.email,
      provincia = req.body.provincia,
      password = req.body.password,
      nombre = req.body.nombre;
try {
  const test = await sql`SELECT checkUserName(${email})`
    if (test.length >= 1) {
      res.send({errors: [{
        "status": 409,
        "title": "Conflict",
        "message": "Email en uso. Utilice otro"
      }]})
    } else {
      const hashPass = bcrypt.hashSync(password, 12)
      await sql`SELECT createUser(${email}, ${provincia}, ${hashPass}, ${nombre})`
      res.send({type: 'response', attributes: {status: "200", title: "Transaction OK", message: 'Datos modificados correctamente'}})
    }
} catch {
  res.status(500).send({errors: [
    {
      "status": 500,
      "title": "Internal error",
      "message": "Error del servidor, contáctese con el administrador"
    }]
  })
}
    

  },
  'getFavs': async function (req, res) {
    const send = {}
    var userId = req.params.id
    const test = await sql`SELECT checkUserById(${userId})`
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
    const userTest = await sql`SELECT checkUserById(${id_usuario})`
    const plantTest = await sql`SELECT * FROM getById(${id_especie})`

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
      try {
        await sql`SELECT setFav(${id_usuario},${id_especie})`
        send.data = {
          "status": 200,
          "title": "Transaction OK",
          "message": 'Favorito agregado'
        }
        res.send(send)
      }
      catch {
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
  'updateUser': async function (req, res) {
    const cookieToken = req.cookies.jwt
    const userData = jwt.verify(cookieToken, process.env.SECRET)

    const email = req.body.email|| null
    const provincia = req.body.provincia || null
    const nombre = req.body.nombre || null
  
    try {
      const test = await sql`SELECT checkUserName(${email})`
        if (test.length >= 1) {
          res.send({errors: [{
            "status": 409,
            "title": "Conflict",
            "message": "Email en uso. Utilice otro"
          }]})
        } else {
          await sql`SELECT updateUser(${userData.id_usuario}, ${email}, ${provincia}, NULL , ${nombre})`
          // Cambiar por un SP o modificar sp updateUser para que devuelva los datos modificados
          const user = await sql`SELECT * FROM usuarios WHERE id_usuario = ${userData.id_usuario}`
          const token = generateToken(user[0])
          res.cookie('jwt', token)
          res.send({type: 'response', attributes: {status: "200", title: "Transaction OK", message: 'Datos modificados correctamente'}})
        }
    } catch (err) {
      console.log(err)
      res.status(500).send({errors: [
        {
          "status": 500,
          "title": "Internal error",
          "message": "Error del servidor, contáctese con el administrador"
        }]
      })
    }
  },

  /*  Elimina un usuario pasado dentro del elemento del body "id_usuario" y activa un trigger 
      que elimina previamente todos sus favoritos */
  'deleteUser': async function (req, res) {
    const send = {}
    var id_usuario = req.body.id_usuario
    const userTest = await sql`SELECT checkUserById(${id_usuario})`

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
      try {
        await sql`SELECT deleteUser(${id_usuario})`
        send.data = {
          "status": 200,
          "title": "Transaction OK",
          "message": 'Usuario correctamente eliminado'
        }
        res.send(send)
      }
      catch {
        send.errors = []
        const err = {
          "status": 500,
          "title": "Internal error",
          "message": "Error del servidor, contáctese con el administrador"
        }
        send.errors.push(err)
        res.status(500).send(send)
      }
    }
  },
  'getProvincias': async function(req, res){
    try {
    const data = await sql`SELECT * FROM getProvincias()`
    res.send({data})
    } catch {
      res.status(500).send({errors: [
        {
          "status": 500,
          "title": "Internal error",
          "message": "Error del servidor, contáctese con el administrador"
        }]
      })
    }
  },
  'setPassword': async function(req, res){
    const passwordActual = req.body.passwordActual
    const nuevoPassword = req.body.nuevoPassword
    const cookieToken = req.cookies.jwt
    const userData = jwt.verify(cookieToken, process.env.SECRET)

    try {
      if(!bcrypt.compareSync(passwordActual, userData.pass)){
        res.send({errors: [{
          "status": 409,
          "title": "Conflict",
          "message": "Password incorrecto"
        }]})
      } else {
          const hashPass = bcrypt.hashSync(nuevoPassword, 12)
          await sql`SELECT updateUser(${userData.id_usuario}, NULL, NULL, ${hashPass} , NULL)`
          // Cambiar por un SP o modificar sp updateUser para que devuelva los datos modificados
          const user = await sql`SELECT * FROM usuarios WHERE id_usuario = ${userData.id_usuario}`
          const token = generateToken(user[0])
          res.cookie('jwt', token)
          res.send({type: 'response', attributes: {status: "200", title: "Transaction OK", message: 'Contraseña modificada correctamente'}})
        }
    } catch (err) {
      console.log(err)
      res.status(500).send({errors: [
        {
          "status": 500,
          "title": "Internal error",
          "message": "Error del servidor, contáctese con el administrador"
        }]
      })
    }
  }
}
module.exports = userController;