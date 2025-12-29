import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Params } from '../../../../../../shared/interface/core.interface';
import { ProductModel, Product } from '../../../../../../shared/interface/product.interface';
import { ProductState } from '../../../../../../shared/state/product.state';

@Component({
  selector: 'app-collection-price-filter',
  templateUrl: './collection-price-filter.component.html',
  styleUrls: ['./collection-price-filter.component.scss']
})
export class CollectionPriceFilterComponent implements OnChanges {

  @Input() filter: Params;

  @Select(ProductState.product) product$: Observable<ProductModel>;

  public minPrice: number = 0;
  public maxPrice: number = 10000;
  public minValue: number = 0;
  public maxValue: number = 10000; // Default max value, adjust based on your needs
  private currentMaxPrice: number = 10000;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private store: Store) {
    // Subscribe to product changes to update max price dynamically
    this.product$.subscribe(products => {
      this.updateMaxPriceFromProducts(products);
    });
  }

  private updateMaxPriceFromProducts(productModel: ProductModel) {
    if (!productModel?.data?.length) {
      this.currentMaxPrice = 10000;
      this.maxValue = 10000;
      this.maxPrice = Math.min(this.maxPrice, this.currentMaxPrice);
      return;
    }

    // Filter products by current category if specified
    let filteredProducts = productModel.data;
    if (this.filter?.['category']) {
      const categorySlug = this.filter['category'];
      filteredProducts = productModel.data.filter(product =>
        product.categories?.some(cat => cat.slug === categorySlug) ||
        product.category?.slug === categorySlug
      );
    }

    if (filteredProducts.length > 0) {
      // Find the maximum price among the products
      this.currentMaxPrice = Math.max(...filteredProducts.map(product => product.price));
      // Round up to nearest 100 for better UX
      this.currentMaxPrice = Math.ceil(this.currentMaxPrice / 100) * 100;
    } else {
      this.currentMaxPrice = 10000;
    }

    // Update max values
    this.maxValue = this.currentMaxPrice;
    this.maxPrice = Math.min(this.maxPrice, this.currentMaxPrice);

    // Ensure min price doesn't exceed new max
    if (this.minPrice > this.maxPrice) {
      this.minPrice = this.maxPrice;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filter'] && this.filter?.['price']) {
      this.parsePriceFromFilter(this.filter['price']);
    } else {
      // Initialize with default values for slider
      this.minPrice = this.minValue;
      this.maxPrice = this.currentMaxPrice; // Use dynamic max for display
    }

    // Update max price when filter changes (category might have changed)
    if (changes['filter']) {
      this.product$.subscribe(products => {
        this.updateMaxPriceFromProducts(products);
      }).unsubscribe(); // Unsubscribe immediately as we only need the current value
    }
  }

  parsePriceFromFilter(priceParam: string) {
    if (!priceParam) {
      this.minPrice = this.minValue;
      this.maxPrice = this.currentMaxPrice;
      return;
    }

    // Handle comma-separated values (take the first range)
    const priceValues = priceParam.split(',');
    const firstPrice = priceValues[0];

    // Handle different formats: "200-400", "10000", etc.
    if (firstPrice.includes('-')) {
      const [min, max] = firstPrice.split('-').map(val => parseFloat(val.trim()));
      this.minPrice = !isNaN(min) ? min : this.minValue;
      this.maxPrice = !isNaN(max) ? max : this.currentMaxPrice;
    } else {
      // Single value - treat as minimum price
      const value = parseFloat(firstPrice);
      if (!isNaN(value)) {
        this.minPrice = value;
        this.maxPrice = this.currentMaxPrice;
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
    if (this.minPrice !== this.minValue || this.maxPrice !== this.currentMaxPrice) {
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
    this.maxPrice = this.currentMaxPrice;
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
    return this.minPrice !== this.minValue || this.maxPrice !== this.currentMaxPrice;
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
