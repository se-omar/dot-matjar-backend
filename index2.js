// const express = require('express');
// const db = require('./database');
// const app = express();

// //==== GET METHOD
// app.get('/api/students', (req, res) => {
//     db.students.findAll().then((data) => {
//         res.send(data);
//     })
// });

// //==== POST METHOD
// app.post('/api/students', async (req, res) => {
//     var r = await db.students.create({
//         username: 'omarayman639',
//         password: 'eshta123',
//         first_name: 'omar',
//         last_name: 'ayman',
//         gender: 'male'
//     })
//     res.send({
//         success: true,
//         message: 'Success',
//         data: r
//     });
// });

// //==== PUT METHOD
// app.put('/api/students/:id', async (req, res) => {
//     var student = await db.students.findOne({
//         where: {
//             student_id: req.params.id
//         }
//     })
//     student.update({
//         username: 'mada6198',
//         password: '4523534',
//         first_name: 'mohamed',
//         last_name: 'ayman',
//         gender: 'male'
//     })
// })

// //==== DELETE METHOD
// app.delete('/api/students/:id', async (req, res) => {
//     var student = await db.students.findOne({
//         where: {
//             student_id: req.params.id
//         }
//     })
//     student.destroy();
// })

// app.listen(3000, () => {
//     console.log('listening on port 3000');
// })