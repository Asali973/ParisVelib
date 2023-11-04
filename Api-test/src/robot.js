import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const meteoApiKey = process.env.METEO_API_KEY;


const urlStationVelib = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/exports/json';
const urlChantier = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-a-paris/exports/json';

const mongoDbUrl = "mongodb://127.0.0.1:27017";

// Connexion à la base de données
mongoose.connect(mongoDbUrl, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DB_NAME,
}).catch(error => console.error('Erreur lors de la connexion à la base de données MongoDB:', error));;
const db = mongoose.connection;

const { Schema } = mongoose;

const meteoSchema = new Schema({
    coord: {
        lon: Number,
        lat: Number,
    },
    weather: [
        {
            id: Number,
            main: String,
            description: String,
            icon: String,
        },
    ],
    base: String,
    main: {
        temp_min: Number,
        temp_max: Number,
        pressure: Number,
        humidity: Number,
    },
    wind: {
        speed: Number,
        deg: Number,
    },
    name: String,

});

// La ville dans laquelle, je souhaite récupérer les données météo
const city = [
    { name: 'Paris', country: 'Fr' },

];
const Meteo = mongoose.model('Meteo', meteoSchema);

// Fonction pour récupérer et enregistrer les données météo

async function fetchAndSaveWeatherData(city, country) {
    const urlMeteo = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&APPID=${meteoApiKey}&units=metric`;

    try {
        const response = await fetch(urlMeteo);
        const data = await response.json();

        const newMeteoData = new Meteo({
            coord: {
                lon: data.coord.lon,
                lat: data.coord.lat,
            },
            weather: data.weather,
            base: data.base,
            main: {
                temp_min: data.main.temp_min,
                temp_max: data.main.temp_max,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
            },
            wind: {
                speed: data.wind.speed,
                deg: data.wind.deg,
            },
            name: data.name,
        });

        await newMeteoData.save();
        console.log('Données météo enregistrées dans la base de données.');
    } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
    }
}



const velibStationSchema = new mongoose.Schema({

    capacity: Number,
    coordonnees_geo: {
        lat: Number,
        lon: Number
    },
    duedate: Date,
    ebike: Number,
    is_installed: String,
    is_renting: String,
    is_returning: String,
    mechanical: Number,
    name: String,
    nom_arrondissement_communes: String,
    numbikesavailable: Number,
    numdocksavailable: Number,
    stationcode: String
});

const VelibStation = mongoose.model('VelibStation', velibStationSchema);

async function fetchAndSaveVelibData() {
    try {
        const response = await fetch(urlStationVelib);
        const velibData = await response.json();
        velibData.forEach(async (station) => {
            if (station.nom_arrondissement_communes === "Paris") {
                const newVelibData = new VelibStation({
                    capacity: station.capacity,
                    coordonnees_geo: {
                        lat: station.coordonnees_geo.lat,
                        lon: station.coordonnees_geo.lon
                    },
                    duedate: new Date(station.duedate),
                    ebike: station.ebike,
                    is_installed: station.is_installed,
                    is_renting: station.is_renting,
                    is_returning: station.is_returning,
                    mechanical: station.mechanical,
                    name: station.name,
                    nom_arrondissement_communes: station.nom_arrondissement_communes,
                    numbikesavailable: station.numbikesavailable,
                    numdocksavailable: station.numdocksavailable,
                    stationcode: station.stationcode
                });

                await newVelibData.save();
            }
        });

        console.log('Données des stations Vélib situées à Paris enregistrées dans la base de données.');
    } catch (error) {
        console.error('Erreur lors de la récupération des données Vélib:', error);
    }
}



const chantierSchema = new mongoose.Schema({

    chantier_cite_id: String,
    chantier_synthese: String,
    cp_arrondissement: String,
    date_debut: Date,
    date_fin: Date,
    /*geo_point_2d: {
        lat: Number,
        lon: Number
    },
    geo_shape: {
        type: String, // Le type de géométrie (peut être différent selon les données)
        coordinates: [] // Les coordonnées de la géométrie
    },*/
    localisation_detail: [String],
    surface: Number
});
const Chantier = mongoose.model('Chantier', chantierSchema);

async function fetchAndSaveChantierData() {
    try {
        const response = await fetch(urlChantier);
        const data = await response.json();

        data.forEach(async (chantier) => {
            const codePostale = chantier.cp_arrondissement;
            // Vérifier si le code postal de l'arrondissement est entre 75000 et 75020 inclus
            if (codePostale >= "75000" && codePostale <= "75020") {
                const newChantierData = new Chantier({
                    chantier_cite_id: chantier.chantier_cite_id,
                    chantier_synthese: chantier.chantier_synthese,
                    cp_arrondissement: codePostale,
                    date_debut: new Date(chantier.date_debut),
                    date_fin: new Date(chantier.date_fin),
                   /* geo_point_2d: {
                        lat: chantier.geo_point_2d.lat,
                        lon: chantier.geo_point_2d.lon
                    },
                    geo_shape: {
                        type: chantier.geo_shape.type,
                        coordinates: chantier.geo_shape.geometry.coordinates
                    },*/
                    localisation_detail: chantier.localisation_detail,
                    surface: chantier.surface
                });

                await newChantierData.save();
            }
        });

        console.log('Données des chantiers situés entre 75000 et 75020 enregistrées dans la base de données.');
    } catch (error) {
        console.error('Erreur lors de la récupération des données de chantier:', error);
    }
}
/*
async function fetchAndSaveData() {
    // Appeler les fonctions pour récupérer et enregistrer les données
    await fetchAndSaveWeatherData('Paris', 'fr');
    await fetchAndSaveVelibData();
    await fetchAndSaveChantierData();
}

// Planifier la collecte de données toutes les 5 minutes (300 000 millisecondes)
setInterval(fetchAndSaveData, 300000);*/

// Appeler les fonctions pour récupérer et enregistrer les données
fetchAndSaveWeatherData('Paris', 'fr');
fetchAndSaveVelibData();
fetchAndSaveChantierData();


