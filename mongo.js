const Person = require('./models/person.js')

const AddPerson = (person) => {
  const newPerson = new Person({
    ...person,
  })

  return newPerson.save()
}

const UpdatePerson = (personToUpdate) => {
  return personToUpdate.save()
}

const DeletePerson = (id) => {
  return Person.findByIdAndDelete(id)
}

const GetPersons = (filter) => {
  return Person.find(filter)
}

const GetPersonById = (id) => {
  return Person.findById(id)
}

module.exports = {
  AddPerson,
  UpdatePerson,
  DeletePerson,
  GetPersons,
  GetPersonById,
}
