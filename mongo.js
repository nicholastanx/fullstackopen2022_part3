const Person = require('./models/person.js')

const AddPerson = (person) => {
  const newPerson = new Person({
    ...person,
  })

  return newPerson.save()
}

const DeletePerson = (id) => {
  return Person.findByIdAndDelete(id)
}

const GetPersons = (filter) => {
  return Person.find(filter)
}

module.exports = { 
  AddPerson, 
  DeletePerson,
  GetPersons
}
