import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Module2 } from './module2';

describe('Module2', () => {
  let component: Module2;
  let fixture: ComponentFixture<Module2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Module2],
    }).compileComponents();

    fixture = TestBed.createComponent(Module2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
