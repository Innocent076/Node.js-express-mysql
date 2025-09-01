import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './routes/usersRout.js'; 
import { createTable } from './tables/createTables.js'

const app = express();
const port = process.env.PORT || 4040;

app.use(bodyParser.urlencoded({ extended: false }));//helps us read url encoded data.

app.use(express.json()); // or bodyParser.json()

//routes
app.use('/api/auth', userRouter);

// Call the function to cretate tables sbefore starting the server
createTable();

//start the server
app.listen((port), () => {
    console.log(`server running on port ${port}`);
});
