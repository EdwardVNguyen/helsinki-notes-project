import { useState, useEffect } from 'react'
import Note from './components/Note'
import Footer from './components/Footer'
import noteService from './services/notes'
import Notification from './components/Notification'

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('a new note...')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState('some error happened...')

  // gets array of notes from json server and update state 
  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  // save note object in json server and update the state
  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }

  const toggleImportanceOf = (id) => {
    // rest of note object is assigned according to its id
    const note = notes.find(n => n.id === id)
    // we don't want to mutate the note object directly, so we create a shallow copy using the spread operator
    const changedNote = { ...note, important: !note.important }

    // replace old object in JSON server and update state accordingly
    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id === id ? returnedNote : note))
      })
      // set error message for 5 seconds if update did not work
      .catch(error => {
        setErrorMessage(`Note '${note.content}' was already removed from server`)
        setTimeout( () => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
    </div>
      <ul>
        {notesToShow.map( note => 
          <Note 
            key={note.id} 
            note={note}
            toggleImportance={ () => toggleImportanceOf(note.id)}
          />
        )}
     </ul>
    <form onSubmit={addNote}>
      <input value={newNote} onChange={handleNoteChange}/>
      <button type="submit">save</button>
    </form> 
    <Footer />
    </div>
  )
}

export default App
