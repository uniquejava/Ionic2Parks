Tab-based app
===

![screen1](screenshots/s1.min.png)
![screen2](screenshots/s2.min.png)
![screen3](screenshots/s3.min.png)

Start new project
```bash
ionic start Ionic2Parks https://github.com/chrisgriffith/Ionic2Parks --v2
```

ionic g page parkDetails

自定义的CustomMapMarker完全是没有必要的, 在for let of中可以直接使用theParker作为navParam.

```js
google.maps.event.addListener(parkMarker, 'click', () => {
  this.navCtrl.push(ParkDetailsPage, {
    parkData: thePark
  });
})
```
