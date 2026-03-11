import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgCat } from './img-cat';

describe('ImgCat', () => {
  let component: ImgCat;
  let fixture: ComponentFixture<ImgCat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgCat],
    }).compileComponents();

    fixture = TestBed.createComponent(ImgCat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
