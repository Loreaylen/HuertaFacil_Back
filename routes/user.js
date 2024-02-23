const express = require('express');
const router = express.Router();
const { login, createUser, getFavs, setFav, updateUser, deleteUser } = require('../controllers/userController')
const validations = require('../utils/registerVal.js')
const {checkSchema, validationResult } = require('express-validator')

router.post('/login', login)
router.post('/createUser', checkSchema(validations), function(req, res){
  const invalid = validationResult(req)
  if(invalid.length > 0){
    const send = {
      "erorrs": invalid
    }
    res.send(send)
  }
  else {
    createUser(req, res)
  }
})

router.get('/getFavs/:userId', getFavs) // ver qué enviar -> datos de sesión?

router.post('/setFav/', setFav)

router.put('/updateUser', updateUser)

router.delete('/deleteUser', deleteUser)

module.exports = router;