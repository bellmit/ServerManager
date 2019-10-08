import { TestBed } from '@angular/core/testing';

import { StorageDevicesService } from './storage-devices.service';

describe('StorageDevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StorageDevicesService = TestBed.get(StorageDevicesService);
    expect(service).toBeTruthy();
  });
});
