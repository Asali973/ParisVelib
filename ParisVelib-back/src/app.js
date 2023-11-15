import mongoose /*, { Collection, Mongoose } */from 'mongoose';
import express from 'express';
import cors from 'cors';

const app= express();



app.use(cors({
    origin: 'http://localhost:4200', // Adjust this when Angular app is on a different origin
    methods: ['GET', 'POST'], // Specify the methods allowed
    allowedHeaders: ['Content-Type'] // Specify headers allowed
  }));

app.get('/',(req, res) => {
    res.send("Bonjour du back");
})

app.listen(process.env.PORT, () => {
    console.log(`Le server est démarré sur le http://localhost:${process.env.PORT}`);
});

/*async function fetchAndSaveVelibData() {
    const client = new Mongoose (mongoDbUrl)
    ;
    let result;
    try {
        
        await  client .connect();
        const db= client.db(DB_NAME);
        const collection =db.collection("xxx") ;


        result = await collection.findOne({"city":city})

        console.log('Données des stations Vélib situées à Paris enregistrées dans la base de données.');

    } catch (error) {
        console.error('Erreur lors de la récupération des données Vélib:', error);
    }
    return result;
}

app.get('/api/velib/stations/name', async (req, res) => {
    try {
        // Appeler la fonction pour récupérer et renvoyer les données des stations Velib
        const velibData = await fetchAndSaveVelibData(); 
        if (!velibData){
        res.status(404).send({ message: 'Aucune donnée Velib disponible.' });
        }
        res.send(velibData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données Velib:', error);
        res.status(500).send({ message: 'Erreur lors de la récupération des données Velib.' });
    }
});*/