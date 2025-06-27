// services/product.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // Mock data dos produtos baseado no HTML fornecido
  private products: Product[] = [
    {
      id: 1,
      name: 'Checked Short Dress',
      price: 12.49,
      originalPrice: 24.99,
      image: 'assets/images/shop/dress/1.jpg',
      hoverImage: 'assets/images/shop/dress/1-1.jpg',
      rating: 4.5,
      category: 'dress',
      inStock: false,
      onSale: true,
      description: 'Elegant checked short dress perfect for casual occasions'
    },
    {
      id: 2,
      name: 'Slim Fit Chinos',
      price: 39.99,
      image: 'assets/images/shop/pants/1-1.jpg',
      hoverImage: 'assets/images/shop/pants/1.jpg',
      rating: 3.5,
      category: 'pants',
      inStock: true,
      description: 'Comfortable slim fit chinos for everyday wear'
    },
    {
      id: 3,
      name: 'Dark Brown Boots',
      price: 49.00,
      image: 'assets/images/shop/shoes/1.jpg',
      hoverImage: 'assets/images/shop/shoes/1-1.jpg',
      rating: 3.0,
      category: 'shoes',
      inStock: true,
      description: 'Stylish dark brown boots with premium leather finish'
    },
    {
      id: 4,
      name: 'Light Blue Denim Dress',
      price: 19.95,
      image: 'assets/images/shop/dress/2.jpg',
      hoverImage: 'assets/images/shop/dress/2-2.jpg',
      rating: 4.0,
      category: 'dress',
      inStock: true,
      description: 'Casual light blue denim dress for a relaxed look'
    },
    {
      id: 5,
      name: 'Unisex Sunglasses',
      price: 11.99,
      originalPrice: 19.99,
      image: 'assets/images/shop/sunglasses/1.jpg',
      hoverImage: 'assets/images/shop/sunglasses/1-1.jpg',
      rating: 3.0,
      category: 'accessories',
      inStock: true,
      onSale: true,
      description: 'Trendy unisex sunglasses with UV protection'
    },
    {
      id: 6,
      name: 'Blue Round-Neck Tshirt',
      price: 9.99,
      image: 'assets/images/shop/tshirts/1.jpg',
      hoverImage: 'assets/images/shop/tshirts/1-1.jpg',
      rating: 3.5,
      category: 'tshirts',
      inStock: true,
      description: 'Comfortable blue cotton t-shirt with round neck'
    },
    {
      id: 7,
      name: 'Silver Chrome Watch',
      price: 129.99,
      image: 'assets/images/shop/watches/1.jpg',
      hoverImage: 'assets/images/shop/watches/1-1.jpg',
      rating: 4.5,
      category: 'accessories',
      inStock: true,
      description: 'Elegant silver chrome watch with precision movement'
    },
    {
      id: 8,
      name: 'Men Grey Casual Shoes',
      price: 39.49,
      originalPrice: 45.99,
      image: 'assets/images/shop/shoes/2.jpg',
      hoverImage: 'assets/images/shop/shoes/2-1.jpg',
      rating: 2.5,
      category: 'shoes',
      inStock: true,
      onSale: true,
      description: 'Comfortable grey casual shoes for men'
    },
    {
      id: 9,
      name: 'Pink Printed Dress',
      price: 39.49,
      image: 'assets/images/shop/dress/3.jpg',
      hoverImage: 'assets/images/shop/dress/3-1.jpg',
      rating: 3.0,
      category: 'dress',
      inStock: true,
      description: 'Beautiful pink printed dress with floral patterns'
    },
    {
      id: 10,
      name: 'Green Trousers',
      price: 21.99,
      originalPrice: 24.99,
      image: 'assets/images/shop/pants/5.jpg',
      hoverImage: 'assets/images/shop/pants/5-1.jpg',
      rating: 3.5,
      category: 'pants',
      inStock: true,
      onSale: true,
      description: 'Stylish green trousers for formal and casual wear'
    },
    {
      id: 11,
      name: 'Men Aviator Sunglasses',
      price: 13.49,
      image: 'assets/images/shop/sunglasses/2.jpg',
      hoverImage: 'assets/images/shop/sunglasses/2-1.jpg',
      rating: 4.0,
      category: 'accessories',
      inStock: true,
      description: 'Classic aviator sunglasses for men with metal frame'
    },
    {
      id: 12,
      name: 'Black Polo Tshirt',
      price: 11.49,
      image: 'assets/images/shop/tshirts/4.jpg',
      hoverImage: 'assets/images/shop/tshirts/4-1.jpg',
      rating: 5.0,
      category: 'tshirts',
      inStock: true,
      description: 'Premium black polo t-shirt with collar'
    }
  ];

  constructor() { }

  // Obter todos os produtos
  getAllProducts(): Observable<Product[]> {
    return of(this.products);
  }

  // Obter produto por ID
  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  // Pesquisar produtos por nome
  searchProducts(searchTerm: string): Observable<Product[]> {
    if (!searchTerm.trim()) {
      return this.getAllProducts();
    }
    
    const filtered = this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return of(filtered);
  }

  // Filtrar produtos por categoria
  getProductsByCategory(category: string): Observable<Product[]> {
    const filtered = this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
    return of(filtered);
  }

  // Obter produtos em promoção
  getSaleProducts(): Observable<Product[]> {
    const saleProducts = this.products.filter(product => product.onSale);
    return of(saleProducts);
  }

  // Obter produtos por faixa de preço
  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    const filtered = this.products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
    return of(filtered);
  }

  // Gerar array de estrelas para rating
  getStarArray(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    // Meia estrela
    if (hasHalfStar) {
      stars.push('half');
    }
    
    // Estrelas vazias
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }
    
    return stars;
  }
}