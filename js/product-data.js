// ДАННЫЕ ТОВАРОВ
        const landingProducts = [
            {
                id: 'p1',
                title: 'Вентилятор CoolBreeze',
                description: 'Вентилятор CoolBreeze – мощный и стильный! Компактный дизайн, 3 скорости, бесшумная работа. Идеален для дома, офиса и летнего отдыха.',
                price: 250,
                oldPrice: 350,
                image: './IMG/vint.jpg',
                badge: 'Хит'
            },
            {
                id: 'p2',
                title: 'Термосумка для пикника',
                description: 'Термосумка 27.5×23×46,5 см сохранит продукты свежими, а напитки – холодными. Компактная и стильная.',
                price: 149,
                oldPrice: null,
                image: './IMG/termosuma.webp',
                badge: 'NEW'
            },
            {
                id: 'p3',
                title: 'Маска для сна Mirate',
                description: 'Маска для сна с гелевой вставкой – комфорт, 100% затемнение и охлаждающий эффект.',
                price: 45,
                oldPrice: null,
                image: './IMG/mask.jpg',
                badge: ''
            },
            {
                id: 'p4',
                title: 'Ночник-увлажнитель Мишка 300 мл',
                description: 'Мягкая подсветка, бесшумная работа и ароматерапия. USB-питание, объем 300 мл.',
                price: 139,
                oldPrice: null,
                image: './IMG/nochnik.jpg',
                badge: 'Топ'
            },
            {
                id: 'p5',
                title: 'Озоновый очиститель для холодильника',
                description: 'Устраняет запахи, бактерии и плесень. Компактный и безопасный.',
                price: 112,
                oldPrice: null,
                image: './IMG/ozonoviy.webp',
                badge: ''
            },
            {
                id: 'p6',
                title: 'Антигравитационный увлажнитель',
                description: 'Парящие капли создают идеальный микроклимат, бесшумно увлажняя пространство.',
                price: 299,
                oldPrice: null,
                image: './IMG/uvlajnitel.jpg',
                badge: 'WOW'
            },
            {
                id: 'p7',
                title: 'Термометр, гигрометр + часы HTC-1',
                description: 'Точные замеры температуры и влажности. Ваш комфорт под контролем!',
                price: 67,
                oldPrice: null,
                image: './IMG/termometr.jpg',
                badge: ''
            },
            {
                id: 'p8',
                title: 'Солнцезащитный крем CuteLover SPF 50, 50ml',
                description: 'Легкая формула без липкости, водостойкий эффект и бережный уход.',
                price: 29,
                oldPrice: null,
                image: './IMG/SPF.jpg',
                badge: 'SPF'
            },
            {
                id: 'p9',
                title: 'Ароматический диффузор 50 мл',
                description: 'Натуральные масла, нежные ароматы. Доступны разные варианты.',
                price: 89,
                oldPrice: null,
                image: './IMG/difuzor-aromatic.webp',
                badge: 'Арома'
            }
        ];

        // РЕНДЕР КАРТОЧЕК
        function renderLandingProducts(){
            const grid = document.getElementById('landing-products-grid');
            if (!grid) return;
            grid.innerHTML = landingProducts.map(p => {
                const title = getProductText(p, 'title');
                const description = getProductText(p, 'description');
                const badge = (currentLang() === 'ru') ? (p.badge || '') : ((productI18n[currentLang()]?.[p.id]?.badge) || (p.badge || ''));
                return `
                <article class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" data-product-id="${p.id}">
                    <div class="relative h-56 bg-gray-100 overflow-hidden">
                        <img src="${p.image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                        ${badge ? `<div class=\"absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded\">${badge}</div>` : ''}
                        ${p.oldPrice ? `<div class=\"absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded\">-${Math.round((1 - p.price/p.oldPrice)*100)}%</div>` : ''}
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">${title}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2">${description}</p>
                        <div class="mt-3 flex items-baseline gap-2">
                            <span class="text-2xl font-bold text-blue-600">${p.price} MDL</span>
                            ${p.oldPrice ? `<span class=\"text-sm text-gray-400 line-through\">${p.oldPrice} MDL</span>` : ''}
                        </div>
                    </div>
                </article>`;
            }).join('');

            grid.querySelectorAll('article').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-product-id');
                    const p = landingProducts.find(x => x.id === id);
                    if (p) showLandingProductModal(p);
                });
            });
        }
        // Initial render
        renderLandingProducts();
        if (window.__rerenderLanding) {
            renderLandingProducts();
            window.__rerenderLanding = false;
        }

        // МОДАЛКА ТОВАРА
        function ensureLandingModalExists(){
            if (document.getElementById('landing-product-modal')) return;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
            <div id="landing-product-modal" class="modal fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="landing-product-title">
                <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                    <div class="p-6 border-b flex justify-between items-center">
                        <h2 id="landing-product-title" class="text-xl font-semibold"></h2>
                        <button class="modal-close text-gray-400 hover:text-gray-600" data-modal="landing-product-modal" aria-label="Закрыть модальное окно">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <img id="lp-image" src="" alt="" class="w-full h-64 object-cover rounded-lg">
                            </div>
                            <div>
                                <h3 id="lp-title" class="text-xl font-bold mb-2"></h3>
                                <p id="lp-desc" class="text-gray-600 mb-4"></p>
                                <div class="mb-4">
                                    <span id="lp-price" class="text-2xl font-bold text-blue-600 mr-2"></span>
                                    <span id="lp-old" class="text-sm text-gray-400 line-through"></span>
                                </div>
                                <button class="order-btn w-full gradient-blue text-white py-3 px-4 rounded-md hover:shadow-lg transition-all duration-300 font-semibold" data-analytics="landing_product">
                                    
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(wrapper.firstElementChild);
            initializeModals();
        }

        function showLandingProductModal(p){
            ensureLandingModalExists();
            document.getElementById('lp-image').src = p.image;
            document.getElementById('lp-image').alt = getProductText(p, 'title');
            document.getElementById('lp-title').textContent = getProductText(p, 'title');
            document.getElementById('lp-desc').textContent = getProductText(p, 'description');
            document.getElementById('lp-price').textContent = `${p.price} MDL`;
            const old = document.getElementById('lp-old');
            if (p.oldPrice) { old.textContent = `${p.oldPrice} MDL`; old.classList.remove('hidden'); } else { old.textContent=''; old.classList.add('hidden'); }

            const btn = document.querySelector('#landing-product-modal .order-btn');
            if (btn) {
                btn.textContent = t('lpModalOrderBtn');
                btn.onclick = () => {
                    closeModal('landing-product-modal');
                    showOrderModal();
                };
            }

            const modal = document.getElementById('landing-product-modal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.classList.add('modal-open');
                setTimeout(()=> modal.classList.add('active'), 10);
                const titleEl = document.getElementById('landing-product-title');
                if (titleEl) titleEl.textContent = t('lpModalTitle');
            }
        }