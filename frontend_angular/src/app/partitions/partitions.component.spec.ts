import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartitionsComponent } from './partitions.component';

describe('PartitionsComponent', () => {
  let component: PartitionsComponent;
  let fixture: ComponentFixture<PartitionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartitionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
