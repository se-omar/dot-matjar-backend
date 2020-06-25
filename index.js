const express = require('express');
const app = express();
const db = require('./database');

async function getStudentsRows() {
    return await db.authors_tutors.findAll();
}

async function getStudents() {
    var r = await db.authors_tutors.findOne({
        where: {
            author_id: 1
        }
    });
    console.log("Row", r);

    await r.update({
        address: "New Address"
    });

    await db.authors_tutors.create({
        address: "Created New Address",
        last_name: "Shokry"
    });

    debugger;
}

app.use(express.json());

const courses = [{
    id: 1,
    name: 'physics'
}, {
    id: 2,
    name: 'biology'
}, {
    id: 3,
    name: 'chemistry'
}]

app.get('/api/courses', async (req, res) => {
    var rows = await getStudentsRows();
    res.send(rows);
})

app.get('/api/courses/:id', (req, res) => {
    var course = courses.find(c => c.id == req.params.id);
    if (!course) res.status(404).send('this id doesnt have a course');
    else res.send(course);
})
app.post('/api/students', (req, res) => {
    res.send("STUDENT IS RETRIEVED");
});
app.post('/api/extcourses', (req, res) => {

    var newCourse = {
        id: courses.length + 1,
        name: req.body.name
    }

    courses.push(newCourse);
    res.send(newCourse);
})

app.put('/api/courses/:id', (req, res) => {
    var course = courses.find(c => c.id == req.params.id);
    course.name = req.body.name;
    if (!course) res.status(404).send('not found');
    else res.send(course);
})

app.delete('/api/courses/:id', (req, res) => {
    var course = courses.find(c => c.id == req.params.id)
    var index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course);
})

const port = process.env.port || 3000;
app.listen(port, async () => {
    getStudents();
    console.log(`listening on port ${port}`)
});