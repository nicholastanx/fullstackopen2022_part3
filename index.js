require('dotenv').config()

const db = require('./mongo.js')
const express = require('express')
const morgan = require('morgan')
const app = express()

morgan.token('body', function(req, res) { 
  if (req.headers['content-type'] == 'application/json') {
    return JSON.stringify(req.body)
  }

  return req.body
})

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status: :res[content-length] - :response-time ms - :body'))

app.get('/info', (request, response) => {
  db.GetPersons().then((result) => {
    response.send(
      `Phonebook has info for ${result.length} people. <br />` + 
      `${new Date()}`
    )
  })
})

app.get('/api/persons', (request, response) => {
  db.GetPersons().then((result) => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const requestedId = request.params.id

  db.GetAllPersons().then((result) => {
    let found = false

    result.forEach((elem) => {
      if (elem.id == requestedId) {
        response.json(elem)
        found = true
      }
    })

    if (!found) {
      response.status(404).send(`Person with id ${requestedId} was not found!`)
    }
  })
})

// app.delete('/api/persons/:id', (request, response) => {
//   const requestedId = request.params.id
//   const lengthBefore = persons.length
//   persons = persons.filter((p) => p.id != requestedId)

//   if (lengthBefore === persons.length) {
//     response.status(404).send(`Person with id ${requestedId} was not found!`)
//     return
//   }

//   response.status(200).send(`Deleted!`)
// })

app.post('/api/persons', (request, response) => {
  /*
    Expected fields:
      application/json
      {
        "name": <...>,
        "number": <...>
      }
  */

  const data = request.body

  db.GetPersons().then((result) => {
    if (!data) {
      response.status(400).send(`missing request body!`)
      return
    } else if (!data.name) {
      response.status(400).send(`'name' field must be provided in the request body!`)
      return
    } else if (!data.number) {
      response.status(400).send(`'number' field must be provided in the request body!`)
      return
    } else if (result.filter((p) => p.name === data.name).length > 0) {
      response.status(400).send(`${data.name} is already in the phonebook!`)
      return
    }

    let getRandomID = () => {
      return Math.floor(Math.random() * 1000000)
    }

    let newPerson = {
      ...data,
      id: getRandomID(),
      date: new Date(),
    }

    while (newPerson.id in result.filter((p) => p.id)) {
      newPerson.id = getRandomID()
    }

    db.AddPerson(newPerson).then(() => {
      response.status(200).send(`${newPerson}`)
    })
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint"} )
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Backend server is running on ${PORT}!`)
})