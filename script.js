const STORAGE_KEY = 'gulshan-jewellers-catalog-v1';
const defaultCategories = ['Rings', 'Necklaces', 'Earrings', 'Bangles'];

const defaultItems = [
  {
    id: 1,
    name: 'Solitaire Diamond Ring',
    category: 'Rings',
    brand: 'BIS 916 (HUID)',
    metal: '18K White Gold',
    weight: '4.20 g',
    purity: '18K',
    price: '₹1,25,000',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: 2,
    name: 'Antique Gold Necklace',
    category: 'Necklaces',
    brand: 'KDM 22K Stamp',
    metal: '22K Yellow Gold',
    weight: '48.50 g',
    purity: '22K',
    price: '₹3,40,000',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: 3,
    name: 'Pearl Drop Earrings',
    category: 'Earrings',
    brand: 'BIS 916',
    metal: '18K Rose Gold',
    weight: '3.10 g',
    purity: '18K',
    price: '₹68,500',
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80'
    ]
  },
  {
    id: 4,
    name: 'Temple Gold Bangles',
    category: 'Bangles',
    brand: 'HUID Hallmark',
    metal: '22K Gold',
    weight: '26.40 g',
    purity: '22K',
    price: '₹2,15,000',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'
    ]
  }
];

const state = {
  categories: [...defaultCategories],
  activeCategory: 'Rings',
  selectedItemId: null,
  items: JSON.parse(JSON.stringify(defaultItems)),
  modalMode: 'add'
};

const refs = {
  categoryList: document.getElementById('categoryList'),
  currentCategoryTitle: document.getElementById('currentCategoryTitle'),
  itemsGrid: document.getElementById('itemsGrid'),
  detailPanel: document.getElementById('detailPanel'),
  detailTitle: document.getElementById('detailTitle'),
  mainPreviewImg: document.getElementById('mainPreviewImg'),
  thumbnailGallery: document.getElementById('thumbnailGallery'),
  detCat: document.getElementById('detCat'),
  detBrand: document.getElementById('detBrand'),
  detMetal: document.getElementById('detMetal'),
  detWeight: document.getElementById('detWeight'),
  detPurity: document.getElementById('detPurity'),
  detPrice: document.getElementById('detPrice'),
  itemsCount: document.getElementById('itemsCount'),
  searchInput: document.getElementById('searchInput'),
  addModal: document.getElementById('addModal'),
  modalTitle: document.getElementById('modalTitle'),
  itemForm: document.getElementById('itemForm'),
  inputName: document.getElementById('inputName'),
  inputCategory: document.getElementById('inputCategory'),
  inputBrand: document.getElementById('inputBrand'),
  inputMetal: document.getElementById('inputMetal'),
  inputWeight: document.getElementById('inputWeight'),
  inputPurity: document.getElementById('inputPurity'),
  inputPrice: document.getElementById('inputPrice'),
  inputPhotos: document.getElementById('inputPhotos')
};

function loadState() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      saveState();
      return;
    }

    const parsed = JSON.parse(existing);
    if (parsed.categories && parsed.categories.length) state.categories = parsed.categories;
    if (parsed.items && parsed.items.length) state.items = parsed.items;
    if (parsed.activeCategory) state.activeCategory = parsed.activeCategory;
  } catch (error) {
    console.warn('Unable to parse local storage data:', error);
    state.categories = [...defaultCategories];
    state.items = JSON.parse(JSON.stringify(defaultItems));
    saveState();
  }
}

function saveState() {
  try {
    const payload = {
      categories: state.categories,
      activeCategory: state.activeCategory,
      items: state.items
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to save catalog state:', error);
  }
}

function init() {
  loadState();
  refs.searchInput.addEventListener('input', renderItems);
  refs.itemForm.addEventListener('submit', handleFormSubmit);
  refs.inputPhotos.addEventListener('change', handlePhotoPreview);

  renderCategories();
  renderItems();
  selectCategory(state.activeCategory, false);
}

function renderCategories() {
  refs.categoryList.innerHTML = '';

  state.categories.forEach((category) => {
    const item = document.createElement('li');
    item.className = `category-item ${category === state.activeCategory ? 'active' : ''}`;
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.innerHTML = `
      <span>${category}</span>
      <span class="count-badge">${countItemsInCategory(category)}</span>
    `;

    item.addEventListener('click', () => selectCategory(category));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCategory(category);
      }
    });

    refs.categoryList.appendChild(item);
  });
}

function countItemsInCategory(category) {
  return state.items.filter((item) => item.category === category).length;
}

function selectCategory(category, shouldRender = true) {
  state.activeCategory = category;
  refs.currentCategoryTitle.textContent = category;
  state.selectedItemId = null;

  if (shouldRender) {
    renderCategories();
    renderItems();
  }

  refs.detailPanel.classList.remove('visible');
}

function renderItems() {
  const searchText = refs.searchInput.value.trim().toLowerCase();
  const filteredItems = state.items.filter((item) => {
    const matchesCategory = item.category === state.activeCategory;
    const matchesSearch = !searchText || item.name.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });

  refs.itemsCount.textContent = `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;
  refs.itemsGrid.innerHTML = '';

  if (!filteredItems.length) {
    refs.itemsGrid.innerHTML = `
      <div class="empty-state">
        <p>No designs found in ${state.activeCategory}.</p>
      </div>
    `;
    return;
  }

  filteredItems.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'item-card';
    card.setAttribute('tabindex', '0');
    card.innerHTML = `
      <img class="item-thumb" src="${item.images[0] || ''}" alt="${item.name}" loading="lazy" />
      <div class="item-info">
        <div class="item-title">${item.name}</div>
        <div class="item-price">${item.price}</div>
      </div>
    `;

    card.addEventListener('click', () => showItemDetails(item.id));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showItemDetails(item.id);
      }
    });

    refs.itemsGrid.appendChild(card);
  });
}

function showItemDetails(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;

  state.selectedItemId = itemId;
  refs.detailPanel.classList.add('visible');
  refs.detailTitle.textContent = item.name;
  refs.mainPreviewImg.src = item.images[0] || '';
  refs.mainPreviewImg.alt = item.name;

  refs.thumbnailGallery.innerHTML = '';
  item.images.forEach((image, index) => {
    const thumb = document.createElement('img');
    thumb.src = image;
    thumb.alt = `${item.name} image ${index + 1}`;
    thumb.title = item.name;
    thumb.addEventListener('click', () => {
      refs.mainPreviewImg.src = image;
    });
    refs.thumbnailGallery.appendChild(thumb);
  });

  refs.detCat.textContent = item.category;
  refs.detBrand.textContent = item.brand || '-';
  refs.detMetal.textContent = item.metal || '-';
  refs.detWeight.textContent = item.weight || '-';
  refs.detPurity.textContent = item.purity || '-';
  refs.detPrice.textContent = item.price || '-';
}

function openAddModal() {
  refs.modalTitle.textContent = 'Add New Jewellery Design';
  state.modalMode = 'add';
  refs.itemForm.reset();
  populateCategorySelect();
  refs.inputCategory.value = state.activeCategory;
  refs.addModal.classList.add('visible');
  refs.addModal.setAttribute('aria-hidden', 'false');
}

function editCurrentItem() {
  if (!state.selectedItemId) return;

  const item = state.items.find((entry) => entry.id === state.selectedItemId);
  if (!item) return;

  refs.modalTitle.textContent = 'Edit Jewellery Design';
  state.modalMode = 'edit';
  populateCategorySelect();

  refs.inputName.value = item.name;
  refs.inputCategory.value = item.category;
  refs.inputBrand.value = item.brand || '';
  refs.inputMetal.value = item.metal || '';
  refs.inputWeight.value = item.weight || '';
  refs.inputPurity.value = item.purity || '';
  refs.inputPrice.value = item.price || '';

  refs.addModal.classList.add('visible');
  refs.addModal.setAttribute('aria-hidden', 'false');
}

function populateCategorySelect() {
  refs.inputCategory.innerHTML = state.categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join('');
}

function closeAddModal() {
  refs.addModal.classList.remove('visible');
  refs.addModal.setAttribute('aria-hidden', 'true');
  refs.itemForm.reset();
  refs.inputPhotos.value = '';
}

function handlePhotoPreview(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  refs.inputPhotos.dataset.previewReady = 'true';
}

function handleFormSubmit(event) {
  event.preventDefault();

  const name = refs.inputName.value.trim();
  const category = refs.inputCategory.value;
  const brand = refs.inputBrand.value.trim();
  const metal = refs.inputMetal.value.trim();
  const weight = refs.inputWeight.value.trim();
  const purity = refs.inputPurity.value.trim();
  const price = refs.inputPrice.value.trim();

  if (!name || !category) {
    alert('Please enter a design name and category.');
    return;
  }

  const imagePromises = Array.from(refs.inputPhotos.files || []).slice(0, 5).map(fileToDataUri);

  Promise.all(imagePromises)
    .then((images) => {
      const finalImages = images.length ? images : getFallbackImages(category, name);

      if (state.modalMode === 'edit' && state.selectedItemId) {
        const itemIndex = state.items.findIndex((entry) => entry.id === state.selectedItemId);
        if (itemIndex >= 0) {
          state.items[itemIndex] = {
            ...state.items[itemIndex],
            name,
            category,
            brand,
            metal,
            weight,
            purity,
            price,
            images: finalImages
          };
        }
      } else {
        const newItem = {
          id: Date.now(),
          name,
          category,
          brand,
          metal,
          weight,
          purity,
          price,
          images: finalImages
        };
        state.items.unshift(newItem);
      }

      state.activeCategory = category;
      saveState();
      renderCategories();
      renderItems();
      closeAddModal();
      const activeItem = state.items.find((item) => item.name === name && item.category === category);
      if (activeItem) showItemDetails(activeItem.id);
    })
    .catch(() => {
      alert('There was an issue processing one or more images.');
    });
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getFallbackImages(category, name) {
  const fallbackMap = {
    Rings: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80'
    ],
    Necklaces: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'
    ],
    Earrings: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80'
    ],
    Bangles: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'
    ]
  };

  return fallbackMap[category] || ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'];
}

function addCategory() {
  const categoryName = window.prompt('Enter new category name:');
  if (!categoryName) return;

  const cleanName = categoryName.trim();
  if (!cleanName) return;

  const alreadyExists = state.categories.some(
    (category) => category.toLowerCase() === cleanName.toLowerCase()
  );

  if (alreadyExists) {
    alert('This category already exists.');
    return;
  }

  state.categories.push(cleanName);
  state.activeCategory = cleanName;
  saveState();
  renderCategories();
  renderItems();
  selectCategory(cleanName, false);
}

function deleteCurrentItem() {
  if (!state.selectedItemId) return;

  const confirmed = window.confirm('Delete this design from the catalog?');
  if (!confirmed) return;

  state.items = state.items.filter((item) => item.id !== state.selectedItemId);
  state.selectedItemId = null;
  saveState();
  renderCategories();
  renderItems();
  refs.detailPanel.classList.remove('visible');
}

window.addEventListener('DOMContentLoaded', init);
