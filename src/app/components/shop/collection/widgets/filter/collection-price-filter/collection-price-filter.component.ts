import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Params } from '../../../../../../shared/interface/core.interface';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent implements OnChanges {

  @Input() filter: Params;

  public minPrice: number = 0;
  public maxPrice: number = 1000;
  public minValue: number = 0;
  public maxValue: number = 10000; // Default max value, adjust based on your needs

  constructor(private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filter'] && this.filter?.['price']) {
      this.parsePriceFromFilter(this.filter['price']);
    } else {
      // Initialize with default values for slider
      this.minPrice = this.minValue;
      this.maxPrice = 1000; // Default max for display
    }
  }

  parsePriceFromFilter(priceParam: string) {
    if (!priceParam) {
      this.minPrice = this.minValue;
      this.maxPrice = 1000;
      return;
    }

    // Handle comma-separated values (take the first range)
    const priceValues = priceParam.split(',');
    const firstPrice = priceValues[0];

    // Handle different formats: "200-400", "1000", etc.
    if (firstPrice.includes('-')) {
      const [min, max] = firstPrice.split('-').map(val => parseFloat(val.trim()));
      this.minPrice = !isNaN(min) ? min : this.minValue;
      this.maxPrice = !isNaN(max) ? max : 1000;
    } else {
      // Single value - treat as minimum price
      const value = parseFloat(firstPrice);
      if (!isNaN(value)) {
        this.minPrice = value;
        this.maxPrice = 1000;
      }
    }
  }

  onMinPriceChange(value: string) {
    const numValue = parseFloat(value);
    this.minPrice = value === '' || isNaN(numValue) ? this.minValue : numValue;
    
    // Ensure min doesn't exceed max
    if (this.minPrice > this.maxPrice) {
      this.minPrice = this.maxPrice;
    }
    
    // Clamp to valid range
    if (this.minPrice < this.minValue) {
      this.minPrice = this.minValue;
    }
    if (this.minPrice > this.maxValue) {
      this.minPrice = this.maxValue;
    }
  }

  onMaxPriceChange(value: string) {
    const numValue = parseFloat(value);
    this.maxPrice = value === '' || isNaN(numValue) ? this.maxValue : numValue;
    
    // Ensure max is not less than min
    if (this.maxPrice < this.minPrice) {
      this.maxPrice = this.minPrice;
    }
    
    // Clamp to valid range
    if (this.maxPrice < this.minValue) {
      this.maxPrice = this.minValue;
    }
    if (this.maxPrice > this.maxValue) {
      this.maxPrice = this.maxValue;
    }
  }

  onInputBlur() {
    // Apply filter when user finishes editing input fields
    this.applyFilter();
  }

  onSliderMinChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.minPrice = value;
    
    // Ensure min doesn't exceed max
    if (this.minPrice > this.maxPrice) {
      this.minPrice = this.maxPrice;
      (event.target as HTMLInputElement).value = this.maxPrice.toString();
    }
    
    // Auto-apply filter on slider change
    this.applyFilter();
  }

  onSliderMaxChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.maxPrice = value;
    
    // Ensure max is not less than min
    if (this.maxPrice < this.minPrice) {
      this.maxPrice = this.minPrice;
      (event.target as HTMLInputElement).value = this.minPrice.toString();
    }
    
    // Auto-apply filter on slider change
    this.applyFilter();
  }

  applyFilter() {
    let priceValue: string | null = null;

    // Always use range format - apply if not at default values
    const defaultMax = 1000;
    if (this.minPrice !== this.minValue || this.maxPrice !== defaultMax) {
      priceValue = `${this.minPrice}-${this.maxPrice}`;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: priceValue,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  clearFilter() {
    this.minPrice = this.minValue;
    this.maxPrice = 1000;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        price: null,
        page: 1
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

  isFilterActive(): boolean {
    return this.minPrice !== this.minValue || this.maxPrice !== 1000;
  }

  getSliderMinPercentage(): number {
    return ((this.minPrice - this.minValue) / (this.maxValue - this.minValue)) * 100;
  }

  getSliderMaxPercentage(): number {
    return ((this.maxPrice - this.minValue) / (this.maxValue - this.minValue)) * 100;
  }

  getSelectedRangeStyle(): { left: string; width: string } {
    const minPercent = this.getSliderMinPercentage();
    const maxPercent = this.getSliderMaxPercentage();
    return {
      left: `${minPercent}%`,
      width: `${maxPercent - minPercent}%`
    };
  }
}
