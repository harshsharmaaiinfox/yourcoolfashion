import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent implements OnInit, OnChanges {

  @Input() filter: Params;

  public minPrice: number = 0;
  public maxPrice: number = 2000;
  public minValue: number = 0;
  public maxValue: number = 2000;

  constructor(private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    this.initializeValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filter'] && !changes['filter'].firstChange) {
      this.initializeValues();
    }
  }

  initializeValues() {
    if (this.filter && this.filter['price']) {
      const priceRange = this.filter['price'].split('-');
      if (priceRange.length === 2) {
        this.minValue = parseInt(priceRange[0]) || this.minPrice;
        this.maxValue = parseInt(priceRange[1]) || this.maxPrice;
      } else {
        // Handle single value or comma-separated values
        const prices = this.filter['price'].split(',');
        if (prices.length > 0) {
          // Try to extract min and max from the first range
          const firstRange = prices[0].split('-');
          if (firstRange.length === 2) {
            this.minValue = parseInt(firstRange[0]) || this.minPrice;
            this.maxValue = parseInt(firstRange[1]) || this.maxPrice;
          }
        }
      }
    } else {
      this.minValue = this.minPrice;
      this.maxValue = this.maxPrice;
    }
  }

  onMinChange(event: Event) {
    const value = parseInt((<HTMLInputElement>event.target).value);
    if (value >= this.minPrice && value < this.maxValue) {
      this.minValue = value;
      this.applyFilter();
    } else if (value >= this.maxValue) {
      // If min tries to exceed max, set it to just below max
      this.minValue = Math.max(this.minPrice, this.maxValue - 1);
      (<HTMLInputElement>event.target).value = this.minValue.toString();
      this.applyFilter();
    }
  }

  onMaxChange(event: Event) {
    const value = parseInt((<HTMLInputElement>event.target).value);
    if (value <= this.maxPrice && value > this.minValue) {
      this.maxValue = value;
      this.applyFilter();
    } else if (value <= this.minValue) {
      // If max tries to go below min, set it to just above min
      this.maxValue = Math.min(this.maxPrice, this.minValue + 1);
      (<HTMLInputElement>event.target).value = this.maxValue.toString();
      this.applyFilter();
    }
  }

  applyFilter() {
    const priceRange = `${this.minValue}-${this.maxValue}`;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: priceRange,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

}
