import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageDevicesComponent } from './storage-devices.component';

describe('StorageDevicesComponent', () => {
  let component: StorageDevicesComponent;
  let fixture: ComponentFixture<StorageDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StorageDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
