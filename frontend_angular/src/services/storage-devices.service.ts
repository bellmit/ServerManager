import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceInfo } from 'src/model/DeviceInfo';
import { PartitionInfo } from 'src/model/PartitionInfo';

@Injectable({
  providedIn: 'root'
})
export class StorageDevicesService {

  constructor(private http: HttpClient) { }

  public GetDevices(): Promise<DeviceInfo[]>
  {
    return this.http.get<DeviceInfo[]>('http://localhost:8080/storageDevices').toPromise();
  }

  public GetPartitions(devicePath: string): Promise<PartitionInfo[]>
  {
    return this.http.get<PartitionInfo[]>('http://localhost:8080/partitions/' + encodeURIComponent(devicePath)).toPromise();
  }
}
