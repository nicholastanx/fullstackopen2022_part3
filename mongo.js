const Person = require('./models/person.js')

const getDbUrl = () => {
  return `mongodb+srv://ntxdbadmin:${process.argv[2]}@cluster0.fkto7.mongodb.net/phonebook?retryWrites=true&w=majority`
}

const getNewPerson = () => {
  return new Person({
    name: process.argv[3], 
    number: process.argv[4]
  })
}

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
