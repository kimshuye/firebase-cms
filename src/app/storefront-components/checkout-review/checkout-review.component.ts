import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { GlobalService } from 'app/services/global.service';
import { LocalCartService } from "app/services/localcart.service";

@Component({
  selector: 'checkout-review',
  templateUrl: './checkout-review.component.html',
  styleUrls: ['./checkout-review.component.css']
})
export class CheckoutReviewComponent implements OnInit {
  order: any;
  user: any;
  now: number;

  constructor(
    public db: AngularFireDatabase,
    public router: Router,
    public globalService: GlobalService,
    public localCart: LocalCartService
  ) {
    this.order = globalService.order.getValue();
    this.user = globalService.user.getValue();
    const now = new Date().getTime();

    if (this.order) {
      if (this.user) {
        this.order.uid = this.user.uid;
      }
      this.order.date = now;
      this.order.status = 'SUBMITTED';
    }

    if (!this.order.billing) {
      router.navigateByUrl('cart');
    }
  }

  confirm() {
    let newKey = Math.abs(this.hashCode(this.order.date) + this.hashCode(this.order.shipping.email));
    this.db.object('/orders/' + newKey).set(this.order);
    this.globalService.cart.next(null);
    this.globalService.order.next(null);
    this.localCart.clearAll();
    if (this.user) {
      this.db.object('/users/' + this.user.uid + '/cart').remove();
      this.db.list('/users/' + this.user.uid + '/orders').push(newKey);
    }
    this.router.navigateByUrl('checkout/confirmation');
  }

  hashCode(input:string) {
    let hash = 0, i, chr;
    if (input.length === 0) return hash;
    for (i = 0; i < input.length; i++) {
      chr   = input.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  ngOnInit() {
  }

}