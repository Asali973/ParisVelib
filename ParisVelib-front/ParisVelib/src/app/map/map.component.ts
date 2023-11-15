import { AfterViewInit, Component } from '@angular/core';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  carte: any;


  icone = new Leaflet.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41]
  });

  constructor() { }

  ngAfterViewInit(): void {
    this.creerCarte();
  }

  creerCarte() {
    const stationVelib = {
      lat: 48.865983,
      lng: 2.294694,
    };

    const niveauZoom = 12;

    this.carte = Leaflet.map('map', {
      center: [stationVelib.lat, stationVelib.lng],
      zoom: niveauZoom
    });

    const mainLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 10,
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    mainLayer.addTo(this.carte);
    this.ajouterMarqueur(stationVelib);

  }
  ajouterMarqueur(coordonnees: { lat: any; lng: any; }) {
    const marqueur = Leaflet.marker([coordonnees.lat, coordonnees.lng], { icon: this.icone });

    marqueur.addTo(this.carte);

  }
}
  


