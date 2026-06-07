import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Module1 } from './module1';

describe('Module1', () => {
  let component: Module1;
  let fixture: ComponentFixture<Module1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Module1],
    }).compileComponents();

    fixture = TestBed.createComponent(Module1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
