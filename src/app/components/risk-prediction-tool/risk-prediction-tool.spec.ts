import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskPredictionTool } from './risk-prediction-tool';

describe('RiskPredictionTool', () => {
  let component: RiskPredictionTool;
  let fixture: ComponentFixture<RiskPredictionTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskPredictionTool],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskPredictionTool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
