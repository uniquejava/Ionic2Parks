Tab-based app
===

![screen1](screenshots/s1.min.png)
![screen2](screenshots/s2.min.png)
![screen3](screenshots/s3.min.png)

### Start new project
ionic start Ionic2Parks --v2 (默认使用tab模板)

或者
```bash
ionic start Ionic2Parks https://github.com/chrisgriffith/Ionic2Parks --v2
```

### Data Provider (http)
src/providers/park-data.ts

```js
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ParkData {
  data: any = null;

  constructor(public http: Http) {}

  load() {
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.http.get('assets/data/data.json')
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;
          resolve(this.data);
        })
    });
  }

  getParks() {
    return this.load().then(data => {
      return data;
    });
  }

}

```
### 启动时预加载数据
src/app/app.component.ts

```js
import {ParkData} from '../providers/park-data';

@Component({
  templateUrl: 'app.html',
  providers: [ParkData]
})
export class MyApp {
  rootPage = TabsPage;

  constructor(platform: Platform, public parkData: ParkData) {
    // ...
    parkData.load();
  }
}


```

### Park List view

```html
<ion-list>
  <ion-item *ngFor="let park of parks" (click)="goParkDetails(park)" detail-push>
    <ion-thumbnail item-left>
      <ion-img src="assets/img/thumbs/{{park.image}}" alt=""></ion-img>
    </ion-thumbnail>
    <h2>{{ park.name }}</h2>
    <p>{{ park.state }}</p>
  </ion-item>
</ion-list>

```

### 向子页面传参
```js
import {ParkData} from '../../providers/park-data';
import {ParkDetailsPage} from '../park-details/park-details';
import {Park} from "../../interfaces/park";

constructor(public navCtrl: NavController, public parkData: ParkData) {
  parkData.getParks().then(theResult => {
    this.parks = theResult;
  })
}

goParkDetails(theParkData) {
  this.navCtrl.push(ParkDetailsPage, {parkData: theParkData});
}
```

### 子页面接收参数
```js
export class ParkDetailsPage {
  parkInfo: Object;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.parkInfo = navParams.data.parkData;
  }
}

```

### Detail page(卡片)
```html
<ion-content>
  <img src="assets/img/headers/{{ parkInfo.image }}" alt="">
  <h1 padding>{{ parkInfo.name }}</h1>
  <ion-card>
    <ion-card-header>Park Details</ion-card-header>
    <ion-card-content>
      {{ parkInfo.data }}

    </ion-card-content>
  </ion-card>
</ion-content>
```

### Google地图
在index.html引入CSP和相关的javascript.
```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src *; img-src * 'self' data:; font-src * 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *">

  <!--Google Maps-->
  <script src="http://maps.google.com/maps/api/js"></script>
```


定义typings
```bash
npm install @types/google-maps --save-dev --save-exact
```

设定样式
```css
  #map_canvas {
    width: 100%;
    height: 100%;
  }
```

定义google map容器
```html
<ion-content>
<div id="map_canvas"></div>
</ion-content>
```

实现google map.
```js

import {Component} from '@angular/core';
import {Platform, NavController, NavParams} from 'ionic-angular';
import {ParkData} from '../../providers/park-data';
import {Park} from "../../interfaces/park";
import {ParkDetailsPage} from '../park-details/park-details';
import {CustomMapMarker} from './custom-marker';
import LatLng = google.maps.LatLng;
import Marker = google.maps.Marker;

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

  initializeMap() {
    let minZoomLevel = 3;
    this.map = new google.maps.Map(document.getElementById('map_canvas'), {
      zoom: minZoomLevel,
      center: new google.maps.LatLng(39.833, -98.583),
      mapTypeControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // add map markers (optional)
    let image = 'assets/img/nps_arrowhead.png';
    this.parkData.getParks().then(theResult => {
      this.parks = theResult;
      for (let thePark of theResult) {
        let parkPos: LatLng = new LatLng(thePark.lat, thePark.long);
        let parkMarker: Marker = new CustomMapMarker(thePark);//new google.maps.Marker();
        parkMarker.setPosition(parkPos);
        parkMarker.setMap(this.map);
        parkMarker.setIcon(image);

        google.maps.event.addListener(parkMarker, 'click', () => {
          let selectedMarker: any = parkMarker;
          this.navCtrl.push(ParkDetailsPage, {
            parkData: selectedMarker.parkData
          });
        })
      }
    });
  }

}

```

### 自定义的MapMarker
custom-marker.ts

```js
import {Park} from '../../interfaces/park';
export class CustomMapMarker extends google.maps.Marker {
  parkData: Park;

  constructor(parkData: Park) {
    super();
    this.parkData = parkData;
  }
}

```

自定义的CustomMapMarker完全是没有必要的, 在for let of中可以直接使用theParker作为navParam.

```js
google.maps.event.addListener(parkMarker, 'click', () => {
  this.navCtrl.push(ParkDetailsPage, {
    parkData: thePark
  });
})
```

### 搜索框
页面:
```html
<ion-header>

  <ion-navbar color="primary">
    <ion-title>National Parks</ion-title>
  </ion-navbar>
  <ion-toolbar>
    <ion-searchbar [(ngModel)]="searchQuery" (ionInput)="getParks($event)" (ionClear)="resetList($event)"></ion-searchbar>
  </ion-toolbar>
</ion-header>
```
实现:
```js
getParks(event) {
  // Reset items back to all of the items
  this.parkData.getParks().then(theResult => {
    this.parks = theResult;
  });

  let queryString = event.target.value;
  if (queryString !== undefined) {
    if (queryString.trim() == '') {
      return;
    }

    this.parkData.getFilteredParks(queryString).then(theResult => {
      this.parks = theResult;
    })
  }
}

resetList(event) {
  this.parkData.getParks().then(theResult => {
    this.parks = theResult;
  })
}
```

### Virtual Scrolling
页面
```html
<ion-list [virtualScroll]="parks">
  <ion-item *virtualItem="let park" (click)="goParkDetails(park)" detail-push>
    <ion-thumbnail item-left>
      <ion-img src="assets/img/thumbs/{{park.image}}" alt=""></ion-img>
    </ion-thumbnail>
    <h2>{{ park.name }}</h2>
    <p>{{ park.state }}</p>
  </ion-item>
</ion-list>
```

### Custom List Headers
页面
```html
<ion-list [virtualScroll]="parks" [headerFn]="customHeaderFn">
  <ion-item-divider *virtualHeader="let header">
    {{ header }}
  </ion-item-divider>
```

实现
```js
customHeaderFn(record, recordIndex, records) {
  if (recordIndex > 0) {
    if (record.name.charAt(0) !== records[recordIndex - 1].name.charAt(0)) {
      return record.name.charAt(0);
    } else {
      return null;
    }

  } else {
    return record.name.charAt(0);
  }
}
```
