import { AfterViewInit, Component } from '@angular/core';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
   
  carte: any;

  constructor(){}
  
  ngAfterViewInit(): void {
    this.creerMap();
  } 

  creerMap() {
    const villeParis = {
      lat: 48.866667,
      lng: 2.333333,
    };

  const niveauZoom = 12;

  this.carte = Leaflet.map('map', {
    center: [villeParis.lat, villeParis.lng],
    zoom: niveauZoom
  });

  const mainLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 10,
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    mainLayer.addTo(this.carte);

}
    
  

}
