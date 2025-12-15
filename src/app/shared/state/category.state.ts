import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetCategories, GetCategoryBySlug, GetSearchByCategory } from "../action/category.action";
import { Category } from "../../shared/interface/category.interface";
import { CategoryService } from "../services/category.service";
import { ThemeCategoryOptions } from "../data/categoryOptions";

export class CategoryStateModel {
  category = {
    data: [] as Category[],
    total: 0
  }
  searchByCategory: Category[]
  selectedCategory: Category | null
}

@State<CategoryStateModel>({
  name: "category",
  defaults: {
    category: {
      data: [],
      total: 0
    },
    searchByCategory: [],
    selectedCategory: null
  },
})
@Injectable()
export class CategoryState {
  
  constructor(private categoryService: CategoryService) {}

  @Selector()
  static category(state: CategoryStateModel) {
    return state.category;
  }

  @Selector()
  static searchByCategory(state: CategoryStateModel) {
    return state.searchByCategory;
  }

  @Selector()
  static selectedCategory(state: CategoryStateModel) {
    return state.selectedCategory;
  }

  @Action(GetCategories)
  getCategories(ctx: StateContext<CategoryStateModel>, action: GetCategories) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: () => { 
          // Use the locally provided seed data instead of the API response, and coerce it to the Category shape
          const categories: Category[] = (ThemeCategoryOptions as any[]).map((cat: any) => ({
            ...cat,
            description: cat?.description ?? '',
            meta_title: cat?.meta_title ?? '',
            meta_description: cat?.meta_description ?? '',
            status: !!cat?.status,
            products_count: cat?.products_count ?? 0,
            category_meta_image_id: cat?.category_meta_image_id ?? 0,
            category_meta_image: cat?.category_meta_image ?? {} as any,
            category_icon: cat?.category_icon ?? cat?.category_image,
            category_image: cat?.category_image ?? cat?.category_icon,
          }));
          ctx.patchState({
            category: {
              data: categories,
              total: categories.length
            }
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(GetSearchByCategory)
  getSearchByCategory(ctx: StateContext<CategoryStateModel>, action: GetSearchByCategory) {
    this.categoryService.searchSkeleton = true;
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            searchByCategory: result ? result?.data : []
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        },
        complete: () => {
          this.categoryService.searchSkeleton = false;
        }
      })
    );
  }

  @Action(GetCategoryBySlug)
  getCategoryBySlug(ctx: StateContext<CategoryStateModel>, action: GetCategoryBySlug) {
    return this.categoryService.getCategoryBySlug(action.slug).pipe(
      tap({
        next: result => { 
          const state = ctx.getState();
          console.log(state)
          ctx.patchState({
            ...state,
            selectedCategory: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

}