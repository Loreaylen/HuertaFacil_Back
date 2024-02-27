const sql = require('../connection.js')

const plantsController = {
'getFilters': function(req, res){

},
'getPlantById': async function(req, res){
const id = req.params.id

try {
  const data = await sql `SELECT * FROM getByID(${id})`

if(data.length === 0){
  const send = {
    "errors":[ {
      "status": 404,
      "title": "Not found",
      "message": "No existe esa planta"
    }]
  }
  res.send(send)
} else {
  const send = {
    "data": data
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
'getCards': async function(req, res){
// agregar lógica de paginado
const page = parseInt(req.query.page) || null
const limit = parseInt(req.query.limit) || null

const startIndex = (page - 1) * limit
const endIndex = page * limit



try {
  const totalPags = await sql`SELECT * FROM getCards()` 
  const data = await sql`SELECT * FROM getCards(offset_val => ${page}, limit_val => ${limit})`
  const paginado = {
    total: totalPags.length,
    items_per_page: limit,
    current_page: page,
    total_pages: Math.ceil(totalPags.length / limit)
    
  }
  if(startIndex > 0) paginado.previous_page = page -1
  if(endIndex < totalPags.length - 1) {
    paginado.next_page = page + 1;
    paginado.next_url = `https://huertafacil-back-dev-szgg.2.us-1.fl0.io/plants/getCards?page=${page + 1}&limit=${limit}`
  }
  
  res.send({pagination: paginado, data: data })
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
'filterBy': function(req, res){
}
}

module.exports = plantsController
