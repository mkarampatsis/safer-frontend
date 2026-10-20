import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReefViewer } from './reef-viewer';

describe('ReefViewer', () => {
  let component: ReefViewer;
  let fixture: ComponentFixture<ReefViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReefViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(ReefViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
