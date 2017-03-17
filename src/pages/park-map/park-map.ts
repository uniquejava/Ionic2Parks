import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import {ParkData} from '../../providers/park-data';
import {Park} from "../../interfaces/park";
import LatLng = google.maps.LatLng;
import Marker = google.maps.Marker;

/*
  Generated class for the ParkMap page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-park-map',
  templateUrl: 'park-map.html'
})
export class ParkMapPage {
  parks: Array<Park> = [];
  map: google.maps.Map;

  constructor(public navCtrl: NavController, public platform: Platform, public parkData: ParkData) {
    this.map = null;
    this.platform.ready().then(() => {
      this.initializeMap();
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParkMapPage');
  }

  initializeMap() {
    let minZoomLevel = 3;
    this.map = new google.maps.Map(document.getElementById('map_canvas'), {
      zoom: minZoomLevel,
      center: new google.maps.LatLng(39.833, -98.583),
      mapTypeControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    let image = 'assets/img/nps_arrowhead.png';
    this.parkData.getParks().then(theResult => {
      this.parks = theResult;
      for (let thePark of theResult) {
        let parkPos: LatLng = new LatLng(thePark.lat, thePark.long);
        let parkMarker: Marker = new Marker();
        parkMarker.setPosition(parkPos);
        parkMarker.setMap(this.map);
        parkMarker.setIcon(image);
      }
    });
  }

}
