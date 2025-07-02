// !!! ОБЯЗАТЕЛЬНО ЗАМЕНИ ЭТОТ URL НА ТОЧНЫЙ URL ТВОЕГО БЭКЕНДА НА RAILWAY.APP !!!
// Например: 'https://web-production-2fdfd.up.railway.app'
const BACKEND_URL = 'web-production-2fdfd.up.railway.app';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('shopId');
    const shopNameElement = document.getElementById('shop-name');
    const shopDescriptionElement = document.getElementById('shop-description');
    const shopLogoElement = document.getElementById('shop-logo');
    const ownerUsernameElement = document.getElementById('owner-username');
    const productsListElement = document.getElementById('products-list');
    const messageDiv = document.getElementById('message');

    if (!shopId) {
        showMessage('ID магазина не указан.', 'error');
        return;
    }

    // Загрузка информации о магазине
    try {
        const shopResponse = await fetch(`${BACKEND_URL}/api/shops/${shopId}`);
        const shopData = await shopResponse.json();

        if (shopResponse.ok) {
            shopNameElement.textContent = shopData.name;
            shopDescriptionElement.textContent = shopData.description;
            shopLogoElement.src = shopData.logo_url || 'placeholder.png'; // Используем заглушку, если нет лого
            ownerUsernameElement.textContent = shopData.owner_username;
        } else {
            showMessage(shopData.message || 'Не удалось загрузить информацию о магазине.', 'error');
            return;
        }
    } catch (error) {
        console.error('Ошибка при загрузке информации о магазине:', error);
        showMessage('Ошибка при подключении к серверу для загрузки магазина.', 'error');
        return;
    }

    // Загрузка товаров магазина
    try {
        const productsResponse = await fetch(`${BACKEND_URL}/api/products/shop/${shopId}`);
        const productsData = await productsResponse.json();

        if (productsResponse.ok) {
            if (productsData.length === 0) {
                productsListElement.innerHTML = '<p>В этой витрине пока нет товаров.</p>';
            } else {
                productsData.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${product.image_url || 'product_placeholder.png'}" alt="${product.name}" class="product-image">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        `;
                    productsListElement.appendChild(productCard);
                });
            }
        } else {
            showMessage(productsData.message || 'Не удалось загрузить товары.', 'error');
        }
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        showMessage('Ошибка при подключении к серверу для загрузки товаров.', 'error');
    }

    function showMessage(message, type) {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});