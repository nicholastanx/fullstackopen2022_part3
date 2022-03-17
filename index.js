require('dotenv').config()

const db = require('./mongo.js')
const errs = require('./errs.js')

const express = require('express')
const morgan = require('morgan')
const person = require('./models/person.js')
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

app.get('/info', (request, response, next) => {
  db.GetPersons()
    .then((result) => {
      response.send(
        `Phonebook has info for ${result.length} people. <br />` + 
        `${new Date()}`
      )
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  db.GetPersons()
    .then((result) => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const requestedId = request.params.id

  db.GetPersonById(requestedId)
    .then((result) => {
      if (!result) {
        response.status(404).send(`Person with id ${requestedId} was not found!`).end()
        return
      }

      response.json(result).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const data = request.body
  const requestedId = request.params.id

  db.GetPersonById(requestedId)
    .then((person) => {
      if (!person) {
        response.status(404).send(errs.IDNotFound)
      }

      person.number = data.number
      db.UpdatePerson(person)
        .then((result) => {
          response.status(200).send(`Updated!`)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const requestedId = request.params.id

  db.DeletePerson(requestedId)
    .then((result) => {
      if (result) {
        response.status(200).send(`Deleted!`)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body

  db.GetPersons()
    .then((result) => {
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
        response.status(400).send(`${data.name} already exists in the phone book!`)
      }

      //  Add new person
      const newPerson = {
        ...data,
        date: new Date(),
      }

      db.AddPerson(newPerson)
        .then(() => {
          response.status(201).send(JSON.stringify(newPerson))
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint"} )
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Backend server is running on ${PORT}!`)
})