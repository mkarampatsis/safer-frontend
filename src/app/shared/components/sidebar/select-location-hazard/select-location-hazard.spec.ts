import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectLocationHazard } from './select-location-hazard';

describe('SelectLocationHazard', () => {
  let component: SelectLocationHazard;
  let fixture: ComponentFixture<SelectLocationHazard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLocationHazard],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectLocationHazard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
