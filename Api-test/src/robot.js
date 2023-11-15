import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const meteoApiKey = /*process.env.METEO_API_KEY;*/"fdf3d10a2bf60d4b60d54332586fe869";
const mongoDbUrl = /*process.env.DB_CONN_STRING; */ "mongodb+srv://jfrancoismagdaline:y2.sKwtCG_bvuVD@cluster0.wcrsvft.mongodb.net";
const dbName = "parisVelib";


const urlStationVelib = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=100';
const urlChantier = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/chantiers-a-paris/records?limit=100";




// Connexion à la base de données
mongoose.connect(mongoDbUrl, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    dbName: dbName,
}).catch(error => console.error('Erreur lors de la connexion à la base de données MongoDB:', error));;


const { Schema } = mongoose;
/*--------------------------- meteo----------------------------------------------*/


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
        let response = await fetch(urlMeteo);
        let data = await response.json();


        let newMeteoData = new Meteo({
            coord: data.coord,
            weather: data.weather,
            base: data.base,
            main: data.main,
            wind: data.wind,
            name: data.name,
        });

        await newMeteoData.save();
        console.log('Données météo enregistrées dans la base de données.');
    } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
    }
}

/*----------------------------station velib ------------------------*/
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

const VelibStationModel = mongoose.model('stationModels', velibStationSchema);



async function getStationVelibData() {
    try {
        let response = await fetch(urlStationVelib);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données des stations velib :', error);

    }
}
/*----------------------------------------------------*/
async function saveStationsVelibParis(stations) {
    for (let station of stations) {
        let stationModel = new VelibStationModel({
            capacity: station.capacity,
            coordonnees_geo: station.coordonnees_geo,
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

        try {
            await stationModel.save();

        } catch (exception) {
            console.error('Erreur lors de l\'enregistrement des données de la station dans la base de données :', exception);
        }
    }

}

// Fonction principale pour récupérer et enregistrer les données des stations velib
async function fetchAndStationVelibData() {
    try {
        let responsedata = await getStationVelibData();
        let maxResult = responsedata.total_count;

        for (let offset = 0; offset < maxResult; offset += 100) {
            responsedata = await getStationVelibData();

            
            // Filtrer les stations par nom_arrondissement)
            const stationVelibParis = responsedata.results.filter(station => station.nom_arrondissement_communes.startsWith('Paris'));


            await saveStationsVelibParis(stationVelibParis);
        }

        console.log('Données des stations Velib mises à jour.');

    } catch (error) {
        console.error('Erreur lors de la récupération des données des stations velib :', error);
    }
}



/*------------------------chantier ------------------------------*/

const chantierSchema = new mongoose.Schema({

    chantier_cite_id: String,
    chantier_synthese: String,
    cp_arrondissement: String,
    date_debut: Date,
    date_fin: Date,
    geo_point_2d: {
        lat: Number,
        lon: Number
    },
    geo_shape: {
        type: {
            type: "String"
        },
        geometry: {
            type: {
                type: "String"
            },
            coordinates: [[[Number]]]
        }
    },
    localisation_detail: [String],
    surface: Number
}
);


chantierSchema.index({ geo_shape: '2dsphere' });
const ChantierModel = mongoose.model('chantierModels', chantierSchema);



const INTERVAL_24_HOURS = 24 * 60 * 60 * 1000;

// Fonction pour récupérer les données des chantiers
async function getChantierData() {
    try {
        let response = await fetch(urlChantier);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données des chantiers :', error);
        throw error; // Propagez l'erreur pour la gestion au niveau supérieur si nécessaire
    }
}

async function saveChantiers(chantiers) {
    const dateActuelle = new Date();

    for (let chantier of chantiers) {
        // Comparer la date de fin du chantier avec la date actuelle
        const dateFinChantier = new Date(chantier.date_fin);

        if (dateFinChantier > dateActuelle) {
            let chantierModel = new ChantierModel({
                chantier_cite_id: chantier.chantier_cite_id,
                chantier_synthese: chantier.chantier_synthese,
                cp_arrondissement: chantier.cp_arrondissement,
                date_debut: chantier.date_debut,
                date_fin: chantier.date_fin,
                geo_point_2d: chantier.geo_point_2d,
                geo_shape: chantier.geo_shape,
                localisation_detail: chantier.localisation_detail,
                surface: chantier.surface,
            });

            try {
                await chantierModel.save();
                //console.log('Données des chantiers enregistrées dans la base de données.');
            } catch (exception) {
                //console.log(exception );
                // Gérer spécifiquement les erreurs liées à la sauvegarde des données si nécessaire
            }
        }
    }
}

// Fonction principale pour récupérer et enregistrer les données des chantiers
async function fetchAndSaveChantierData() {
    try {
        let responsedata = await getChantierData();
        let maxResult = responsedata.total_count;

        for (let offset = 0; offset < maxResult; offset += 100) {
            responsedata = await getChantierData();

            // Filtrer les chantiers par code postal (cp_arrondissement)
            const chantiersParis = responsedata.results.filter(chantier =>
                chantier.cp_arrondissement.startsWith('750')
            );

            await saveChantiers(chantiersParis);
        }

        console.log('Données des chantiers mises à jour.');

    } catch (error) {
        console.error('Erreur lors de la récupération des données des chantiers :', error);
    }
}

// Planifier l'exécution de la fonction toutes les 24 heures
setInterval(fetchAndSaveChantierData,  24 * 60 * 60 * 1000);
//fetchAndSaveChantierData();
//fetchAndSaveWeatherData('Paris', 'fr');

// Collecter et enregistrer les données Velib toutes les 5 minutes (300 000 ms)
setInterval(fetchAndStationVelibData, 300000);
//fetchAndStationVelibData()






