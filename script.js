function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function reloadCart() {
    const cartSection = document.querySelector('.cart__items');

    cartSection.innerHTML = '';
}

function cartItemClickListener(event) {
  
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const Cart = {
  data: [],
};

const DOM = {
  populateProducts(products) {
    const sectionList = document.querySelector('.items');

    products.forEach((product) => {
      sectionList.appendChild(
        createProductItemElement({ 
          sku: product.id, 
          name: product.title, 
          image: product.thumbnail,
        }),
      );
    });    
  },

  populateCart() {
    const cartSection = document.querySelector('.cart__items');

    reloadCart();

    Cart.data.forEach((product) => {
      cartSection.appendChild(
        createCartItemElement({ 
          sku: product.id, 
          name: product.title, 
          salePrice: product.price, 
        }),
      );
    });
  },

  getProductPrice(productPrice) {
  },

  add(product) {
    Cart.data.push(product);
    DOM.populateCart(Cart.data);

    console.log(Cart.data); 
  },

  remove(index) {
  },

};

const API = {
  async loadProducts() {
    const response = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador');
    const productList = await response.json();
    const products = productList.results;

    return products;
  },

  async loadCart(item) {
    const response = await fetch(`https://api.mercadolibre.com/items/${item}`);
    const cartList = await response.json();

    DOM.add(cartList);
  },

  getCartItemId(items) {
    const itemId = items.parentElement;
    API.loadCart(getSkuFromProductItem(itemId));
  },

  cartAddListener() {
    const buttons = document.getElementsByClassName('item__add');

    for (let items = 0; items < buttons.length; items += 1) {
      buttons[items].addEventListener('click', () => {
       API.getCartItemId(buttons[items]);
      });
    }
  },
};

const App = {

  init() {
    window.onload = async () => {
      let productsData = [];

      try {
        productsData = await API.loadProducts();
        DOM.populateProducts(productsData);
        API.cartAddListener();
      } catch (error) {
        console.log('Error!');
        console.log(error);
      }
    };
  },
};

App.init();