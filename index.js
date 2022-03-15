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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/info', (request, response) => {
  response.send(
    `Phonebook has info for ${persons.length} people. <br />` + 
    `${new Date()}`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const requestedId = request.params.id
  const target = persons.filter((p) => p.id == requestedId)

  if (target.length == 0) {
    response.status(404).send(`Person with id ${requestedId} was not found!`)
    return
  }

  response.json(target[0])
})

app.delete('/api/persons/:id', (request, response) => {
  const requestedId = request.params.id
  const lengthBefore = persons.length
  persons = persons.filter((p) => p.id != requestedId)

  if (lengthBefore === persons.length) {
    response.status(404).send(`Person with id ${requestedId} was not found!`)
    return
  }

  response.status(200).send(`Deleted!`)
})

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

  if (!data) {
    response.status(400).send(`missing request body!`)
    return
  } else if (!data.name) {
    response.status(400).send(`'name' field must be provided in the request body!`)
    return
  } else if (!data.number) {
    response.status(400).send(`'number' field must be provided in the request body!`)
    return
  } else if (persons.filter((p) => p.name === data.name)) {
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

  while (newPerson.id in persons.filter((p) => p.id)) {
    newPerson.id = getRandomID()
  }

  persons = persons.concat(newPerson)
  response.status(200).send(`${newPerson}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint"} )
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Backend server is running on ${PORT}!`)
})