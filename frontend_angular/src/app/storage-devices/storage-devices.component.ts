import { Component, OnInit } from '@angular/core';
import { DeviceInfo } from '../../model/DeviceInfo';
import { StorageDevicesService } from 'src/services/storage-devices.service';

@Component({
  selector: 'app-storage-devices',
  templateUrl: './storage-devices.component.html',
  styleUrls: ['./storage-devices.component.scss']
})
export class StorageDevicesComponent implements OnInit {

  constructor(private storageDevicesService: StorageDevicesService) { }

  private loading: boolean = true;
  private devices: DeviceInfo[] = [];

  ngOnInit() {
    this.GetDevices();
  }

  //Private methods
  private async GetDevices()
  {
    this.devices = await this.storageDevicesService.GetDevices();
    this.loading = false;
  }

}
