import { Component, OnInit } from '@angular/core';
import { StorageDevicesService } from 'src/services/storage-devices.service';
import { ActivatedRoute } from '@angular/router';
import { PartitionInfo } from 'src/model/PartitionInfo';

@Component({
  selector: 'app-partitions',
  templateUrl: './partitions.component.html',
  styleUrls: ['./partitions.component.scss']
})
export class PartitionsComponent implements OnInit {

  constructor(private storageDevicesService: StorageDevicesService, private route: ActivatedRoute)
  {
    route.paramMap.subscribe( (value) => {
      this.devicePath = value.get('devicePath');
    });
  }

  private loading: boolean = true;
  private devicePath: string;
  private partitions: PartitionInfo[] = [];

  ngOnInit() {
    this.GetPartitions();
  }

  //Private methods
  private async GetPartitions()
  {
    this.partitions = await this.storageDevicesService.GetPartitions(this.devicePath);
    this.loading = false;
  }

}
