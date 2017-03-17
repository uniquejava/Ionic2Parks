import {Park} from '../../interfaces/park';
export class CustomMapMarker extends google.maps.Marker {
  parkData: Park;

  constructor(parkData: Park) {
    super();
    this.parkData = parkData;
  }
}
