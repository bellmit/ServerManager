import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  //Members
  private usbDevices = [
    {
      name: 'USB Device 1',
      working: false
    },
    {
      name: 'USB Device 2',
      working: true
    },
    {
      name: 'USB Device 3',
      working: false
    },
  ];
}