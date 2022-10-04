const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;
const notes = require('./db/db.json');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

const readFromFile = util.promisify(fs.readFile);

app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title, text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    fs.readFile('./db/db.json', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log((JSON.parse(data)).length)
        const parsedNotes = JSON.parse(data);
        parsedNotes.push(newNote);

        fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4),
      (writeErr) => 
        writeErr
          ? console.error(writeErr)
          : console.info('Success in uploading new note')
        );
      }
    });


    const response = {
      status: 'success',
      body: newNote,
    };
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note")
  }
});

app.delete(`/api/notes/:id`, (req, res) => {
  readFromFile('./db/db.json').then((data) => {
    const parsedData = JSON.parse(data)
    const parsedDataSplice = parsedData.splice(0, parsedData.length)
    const newNotes = []
    for (let i = 0; i < parsedDataSplice.length; i++) {
      if (req.params.id !== parsedDataSplice[i].id) {
        newNotes.push(parsedDataSplice[i])
      } else {
        console.log('Deleted Note: ' + parsedDataSplice[i])
      }
    }
    fs.writeFile('./db/db.json', JSON.stringify(newNotes, null, 4),
    (writeErr) => 
        writeErr
          ? console.error(writeErr)
          : console.info('Success in deleting a note!')
        );
        const response = {
          status: 'success',
          body: newNotes,
        };
        res.status(201).json(response);
  });
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);