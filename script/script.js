'use strict'
document.addEventListener('DOMContentLoaded', () => {

    const search = document.querySelector('.search');
    const cartBtn = document.getElementById('cart');
    const wishlistBtn = document.getElementById('wishlist');

    const goodsWrapper = document.querySelector('.goods-wrapper');
    const cart = document.querySelector('.cart');
    const category = document.querySelector('.category');
    const cartCounter = cartBtn.querySelector('.counter');
    const wislistCounter = wishlistBtn.querySelector('.counter');
    const cartWrapper = document.querySelector('.cart-wrapper');

    let wishlist = [];

    let goodsInBasket = {};

    const loading = (nameFunction) => {
        const spinner = `
        <div id="spinner">
            <div class="spinner-loading">
            <div><div><div></div></div><div><div>
            </div></div><div><div></div></div><div>
            <div></div></div></div></div>
        </div>`

        if (nameFunction === 'renderCard') {
            goodsWrapper.innerHTML = spinner;
        }

        if (nameFunction === 'renderCart') {
            cartWrapper.innerHTML = spinner;
        }
    }

    // Request on server
    const getGoods = (handler, filter) => {
        loading(handler.name);
        fetch('db/db.json')
        .then(responce => responce.json())
        .then(filter)
        .then(handler);
    };

    // Create product card
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `
        <div class="card">
            <div class="card-img-wrapper">
                <img class="card-img-top" src="${img}" alt="">
                <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" 
                    data-goods-id="${id}"></button>
            </div>
            <div class="card-body justify-content-between">
                <a href="#" class="card-title">${title}</a>
                <div class="card-price">${price} Р</div>
                <div>
                    <button class="card-add-cart"
                        data-goods-id="${id}">Добавить в корзину</button>
                </div>
            </div>
        </div>`;
        
        return card;
    };

    // Rendering of goods into cart 
    const createBasketGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `
        <div class="goods-img-wrapper">
            <img class="goods-img" src="${img}" alt="">
        </div>
        <div class="goods-description">
            <h2 class="goods-title">${title}</h2>
            <p class="goods-price">${price} ₽</p>
        </div>
        <div class="goods-price-count">
            <div class="goods-trigger">
                <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" data-goods-id="${id}"></button>
                <button class="goods-delete" data-goods-id="${id}"></button>
            </div>
            <div class="goods-count">${goodsInBasket[id]}</div>
        </div>`;
        
        return card;
    };

    // Render card
    const renderCard = (item) => {
        goodsWrapper.textContent = '';

        if (item.length) {
            item.forEach((item) => {
                const { id, title, price, imgMin } = item;
                goodsWrapper.append(createCardGoods(id, title, price, imgMin));
            });
        } else {
            goodsWrapper.textContent = '❌ По вашему запросу ничего не найдено!';
        } 
    }

    // Render basket
    const renderBasket = (item) => {
        cartWrapper.textContent = '';

        if (item.length) {
            item.forEach((item) => {
                const { id, title, price, imgMin } = item;
                cartWrapper.append(createBasketGoods(id, title, price, imgMin));
            });
        } else {
            cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
        }
        
    }

    // Calculation of total price
    const calcTotalPrice = goods => {        
        let totalPrice = goods.reduce((accum, item) => {
            return accum + (item.price * goodsInBasket[item.id]);
        }, 0);
        cart.querySelector('.cart-total>span').textContent = totalPrice.toFixed(2);
    };

    const checkCount = () => {
        wislistCounter.textContent = wishlist.length;
        cartCounter.textContent = Object.keys(goodsInBasket).length;
    };

    // Filters
    const showBasketItems = (goods) => {
        const itemInBasketList = goods.filter(item => goodsInBasket.hasOwnProperty(item.id));
        calcTotalPrice(itemInBasketList);
        return itemInBasketList;
    };

    const onWishlistBtnClick = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)));
    };
    
    const randomSort = (item) => item.sort(() => Math.random() - 0.5);

    // Work with storages 
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsInBasket')) {
                Object.assign(goodsInBasket, JSON.parse(getCookie('goodsInBasket')));
            }
        
            checkCount();
        } else {
            document.cookie = `goodsInBasket=${JSON.stringify(goodsInBasket)}; max-age=86400e3`
        };
    };

    const storageQuery = (get) => {
        if (get) {
            if (localStorage.getItem('wishlist')) {
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')));       
                checkCount();
            }            
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));    
        };
    };

    
    //Open/Close basket
    const closeCart = (event) => {
        const target = event.target;

        if (target === cart || target.classList.contains('cart-close')) {
            cart.style.display = 'none';
        };
    };
    
    const onEscKeyPress = (event) => {
        if (event.keyCode === 27) {
            cart.style.display = 'none';
            window.removeEventListener(onEscKeyPress);
        };
    };

    const openCart = (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();
        };
        
        cart.style.display = 'flex';
        window.addEventListener('keydown', onEscKeyPress);
        getGoods(renderBasket, showBasketItems);
    };

    // Handlers
    const onCategoryButtonClick = event => {
        event.preventDefault();
        const target = event.target;

        if (target.classList.contains('category-item')) { 
            const cat = target.dataset.category;
            getGoods(renderCard, goods => goods.filter(item => item.category.includes(cat)));
        };
    };

    const onSearchFormSubmit = event => {
        event.preventDefault();

        const searchInput = event.target.elements.searchGoods;
        const searchInputValue = searchInput.value.trim();

        if (searchInputValue !== '') {
            getGoods(renderCard, goods => goods.filter(item => 
                item.title.toLowerCase().indexOf(searchInputValue.toLowerCase()) !== -1 ? true : false)
            );
        } else {
            search.classList.add('error');
            setTimeout(()=> {
                search.classList.remove('error');
            }, 2000)
        }
        searchInput.value = '';
    };

    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {
            wishlist.splice( wishlist.indexOf(id), 1);
            elem.classList.remove('active');
        } else {
            wishlist.push(id);
            elem.classList.add('active');
        };

        checkCount();
        storageQuery();
    };

    const addToBasket = (id) => {
        if (goodsInBasket[id]) {
            goodsInBasket[id] += 1;
        } else {
            goodsInBasket[id] = 1;
        }

        checkCount();
    };

    const onProductButtonClick = event => {
        const target = event.target;

        if (target.classList.contains('card-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        };

        if (target.classList.contains('card-add-cart')) {
            addToBasket(target.dataset.goodsId);
            cookieQuery();
        };
    };

    const removeProduct = id => {
        delete goodsInBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showBasketItems);
    }

    const onBasketProductButtonClick = event => {
        const target = event.target;

        if (target.classList.contains('goods-add-wishlist')) {
            toggleWishlist(target.dataset.goodsId, target);
        };

        if (target.classList.contains('goods-delete')) {
            removeProduct(target.dataset.goodsId);
        };
    };

    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    category.addEventListener('click', onCategoryButtonClick);
    search.addEventListener('submit', onSearchFormSubmit);
    goodsWrapper.addEventListener('click', onProductButtonClick);
    cartWrapper.addEventListener('click', onBasketProductButtonClick);
    wishlistBtn.addEventListener('click', onWishlistBtnClick);

    getGoods(renderCard, randomSort);

    storageQuery(true);
    cookieQuery(true);
});