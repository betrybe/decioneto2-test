const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('cartproducts')) || [];
  },

  set(products) {
    localStorage.setItem('cartproducts', JSON.stringify(products));
  },
};

const Cart = {
  data: Storage.get(),
};

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

function removeItem(element) {
  Cart.data = Cart.data.filter((product, index) => index !== Number(element));
}

function getProductPrice() {
  const priceContainer = document.querySelector('.total-price');
  let total = 0;

  Cart.data.forEach((product) => {      
    total += product.price;
  });
  
  priceContainer.innerHTML = total;
}

function cartItemClickListener(event) {
  removeItem(event.srcElement.dataset.index);
  DOM.populateCart();
  getProductPrice();
}

function createCartItemElement({ index, sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.dataset.index = index;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const DOM = {
  // Adiciona os produtos em tela
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

  // Adiciona os produtos no carrinho
  populateCart() {
    const cartSection = document.querySelector('.cart__items');

    reloadCart();

    Cart.data.forEach((product, index) => {
      cartSection.appendChild(
        createCartItemElement({
          index,
          sku: product.id, 
          name: product.title, 
          salePrice: product.price, 
        }),
      );
    });

    Storage.set(Cart.data);
  },

  // Adiciona os produtos no array do cart
  add(product) {
    Cart.data.push(product);
    DOM.populateCart(Cart.data);
  },

  emptyCart() {
    Cart.data = [];
    Storage.set(Cart.data);
    DOM.populateCart();
    getProductPrice();
  },
};

const API = {

  cartAddListener() {
    const buttons = document.getElementsByClassName('item__add');

    for (let items = 0; items < buttons.length; items += 1) {
      buttons[items].addEventListener('click', () => {
       API.getCartItemId(buttons[items]);
      });
    }
  },

  // requisição dos produtos
  loadProducts() {
    const loading = document.querySelector('.loading');

    loading.innerHTML = 'loading';

    fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
    .then((response) => response.json())
    .then((products) => { 
      loading.remove();
      DOM.populateProducts(products.results);
      API.cartAddListener();
    });
  },

  // requisição dos produtos para o cart
    loadCart(item) {
    fetch(`https://api.mercadolibre.com/items/${item}`)
    .then((response) => response.json())
    .then((cartItems) => {
      DOM.add(cartItems);
      getProductPrice();
      Storage.set(Cart.data);
    })
    .catch((error) => console.log(error));
  },

  // pega o id do produto selecionado
  getCartItemId(items) {
    const itemId = items.parentElement;
    API.loadCart(getSkuFromProductItem(itemId));
  },
};

const App = {

  init() {
    window.onload = () => {
      try {
        API.loadProducts();
        DOM.populateCart();
        getProductPrice();
      } catch (error) {
        console.log('Error!');
        console.log(error);
      }
    };
  },
};

App.init();