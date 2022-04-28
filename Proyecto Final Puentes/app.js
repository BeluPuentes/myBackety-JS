
const cartBtn = document.querySelector(".cart-icon");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverly = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-total-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-container");
const btnComprar =document.querySelector('.buy-cart')

//CART
let cart = [];
let productsArray = [];
let buttonsDOM = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(product => {
        const { title, price, desc, stock } = product.fields;
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image, desc, stock};
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {

      result += `
      <div class="product-card">
      <div class="card-image">
        <img src=${product.image} alt=${product.title} />
        <button class="card-button" data-id=${product.id}>
          <i class="fas fa-cart-arrow-down"></i>
          Add to the Cart
        </button>
      </div>
      <div class="info">
        <h3 class="name">${product.title}</h3>
        <h5>${product.desc}</h5>
        <h4 class="price">$${product.price}</h4>
      </div>
    </div>`;
    });
    productsDOM.innerHTML = result;
  }
 
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".card-button")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "En el Carrito";
        button.disabled = true;
      }
      button.addEventListener("click", e => {
        e.target.innerText = "En el Carrito";
        e.target.disabled = true;

        let cartItem = {
          ...Storage.getProduct(e.target.dataset.id),
          amount: 1
        };
      
        cart.push(cartItem);
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(cartItem);
        this.onShowCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.amount * item.price;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = `Total: $${parseFloat(tempTotal.toFixed(2))}`;
  }
  addCartItem(item) {
    const { image, price, title, amount, id } = item;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML += `
    <div class="img-container">
    <img src=${image} alt=${title} />
  </div>
  <div class="cart-product-info">
    <h4>${title}</h4>
    <h4>$${price}</h4>
    <button class="remove" data-id=${id}>Borrar</button>
  </div>
  <div class="quantity">
    <i class="fas fa-angle-up" data-id=${id}></i>
    <h4 class="item-amount">${amount}</h4>
    <i class="fas fa-angle-down" data-id=${id}></i>
  </div>
    `;
    cartContent.appendChild(div);
  }
  onShowCart() {
    cartOverly.classList.toggle("transparentBcg");
    cartDOM.classList.toggle("showCart");
  }
  setUpAPP() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.onShowCart);
    closeCartBtn.addEventListener("click", this.onShowCart);
    this.cartLogic();
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    btnComprar.addEventListener("click", () => {
        this.checkPago();
        this.clearCart();   
    });
    
    cartContent.addEventListener("click", e => {
      if (e.target.classList.contains("remove")) {
        let removeItem = e.target;
        let id = e.target.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-angle-up")) {
        let cartItem = e.target;
        let id = e.target.dataset.id;
        let item = cart.find(item => item.id === id);
       
        if(item.amount<item.stock){
            item.amount += 1;
            this.setCartValue(cart);
            Storage.saveCart(cart);
            cartItem.nextElementSibling.innerText = item.amount;
        }else{
            Swal.fire({
                title:'No hay suficiente stock!',
                text:`Solo hay ${item.stock} de ${item.title}`,
                icon:'warning'
            })
        } 
      } else if (e.target.classList.contains("fa-angle-down")) {
        let cartItem = e.target;
        let id = e.target.dataset.id;
        let item = cart.find(item => item.id === id);
        item.amount = item.amount - 1;
        if (item.amount === 0) {
          this.removeItem(id);
          this.setCartValue(cart);
          cartContent.removeChild(cartItem.parentElement.parentElement);
        } else {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          cartItem.previousElementSibling.innerText = item.amount;
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      console.log(cartContent.children[0]);
      cartContent.removeChild(cartContent.children[0]);
    }
    this.onShowCart();
  }
  
  checkPago(){
    let tempTotal=0;
    let itemsTotal=0;
    cart.map(item=>{
        tempTotal+= item.price * item.amount;
        itemsTotal+=item.amount
    })
    if(itemsTotal>0)
    {
      Swal.fire({
        title:'El pago ha sido procesado con EXITO!',
        text:`El total fue de: $${tempTotal}`,
        icon:'success'
      })
      this.clearCart()
    }
    else{
      Swal.fire({
        title:'El carrito esta vacio',
        icon:'error'
      })

    }
   

}


  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = ` <i class="fas fa-cart-arrow-down"></i>Add to the Cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}


//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    return productsArray.find(item => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpAPP();
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
      productsArray = products;
    })
    .then(() => {
      ui.getBagButtons();
    });
});
