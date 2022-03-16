const Person = require('./models/person.js')

const AddPerson = (person) => {
  const newPerson = new Person({
    ...person,
  })

  newPerson.save()
}

const GetAllPersons = (filter) => {
  return Person.find({})
}

module.exports = { 
  AddPerson, 
  GetAllPersons
}
