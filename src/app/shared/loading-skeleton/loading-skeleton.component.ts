import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.css']
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'list' | 'text' | 'avatar' | 'product' = 'card';
  @Input() rows: number = 3;
  @Input() height: string = '20px';
  @Input() width: string = '100%';
  @Input() animated: boolean = true;

  getSkeletonClass(): string {
    let classes = 'skeleton';
    if (this.animated) {
      classes += ' skeleton-animated';
    }
    return classes;
  }

  getRowArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }
}