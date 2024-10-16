var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { API_URL } from './constants/API_URL.js';
import { getCats } from './ts/api.js';
import { handleLike } from './ts/handleLike.js';
import { openModal } from './ts/modal.js';
import { updatePagination } from './ts/pagination.js';
import { randomTags } from './utils/randomTags.js';
const catList = document.getElementById('catList');
const currentPage = 1;
const tagInput = document.getElementById('tagInput');
const addTagButton = document.getElementById('addTagButton');
const tagList = document.getElementById('tagList');
const tags = [];
let currentCatId = null;
const tagSearchInput = document.getElementById('tagSearch');
const loading = document.getElementById('loading');
// 로컬스토리지에서 특정 id에 대한 태그 가져오기
const getTag = (id) => {
    const storedTags = localStorage.getItem(id);
    return storedTags ? JSON.parse(storedTags) : [];
};
// 로컬스토리지에 특정 id에 대한 태그 저장하기
const postTag = (id, tag) => {
    localStorage.setItem(id, JSON.stringify([...new Set(tag)]));
};
// 초기 태그값
const getInitialTags = (id) => {
    const initialTags = getTag(id);
    initialTags.forEach((tag) => {
        addTag(tag);
    });
};
// 고양이 카드에 태그를 업데이트하는 함수
const updateCatTag = (catId) => {
    const catItemTagContainer = document.querySelector(`[data-catId="${catId}"] .tagContainer`);
    if (catItemTagContainer) {
        catItemTagContainer.innerHTML = '';
        const updatedTags = getTag(catId);
        updatedTags.forEach((tag) => {
            const tagElement = createTagElement(tag);
            catItemTagContainer.appendChild(tagElement);
        });
    }
};
// 태그 요소 생성
const createTagElement = (tagValue) => {
    const tagElement = document.createElement('span');
    tagElement.textContent = `#${tagValue}`;
    tagElement.className =
        'relative border border-gray-300 text-gray-500 rounded-full px-2 mr-1 py-1 mb-2 text-xs';
    return tagElement;
};
addTagButton.addEventListener('click', () => {
    if (!currentCatId)
        return;
    const tagValue = tagInput.value.trim();
    if (tagValue) {
        addTag(tagValue);
    }
    updateCatTag(currentCatId);
});
// 태그 추가 및 삭제 기능 구현
const addTag = (tagValue) => {
    if (!currentCatId)
        return;
    tags.push(tagValue);
    const tagElement = createTagElement(tagValue);
    // 태그 삭제 버튼 생성
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.className =
        'absolute -top-2 -right-3 text-white rounded-full bg-blue-500 w-6 h-6 flex items-center justify-center p-1';
    // 삭제 버튼 클릭 이벤트 리스너
    deleteButton.addEventListener('click', () => {
        if (!currentCatId)
            return;
        tags.splice(tags.indexOf(tagValue), 1);
        tagList.removeChild(tagElement);
        postTag(currentCatId, tags);
        updateCatTag(currentCatId);
    });
    tagElement.appendChild(deleteButton);
    tagList.appendChild(tagElement);
    tagInput.value = '';
    postTag(currentCatId, [...new Set(tags)]);
};
// 고양이 카드 생성
const createCatCard = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const cats = yield getCats(page);
    catList.innerHTML = '';
    cats.slice(0, 9).forEach((cat) => {
        const catItem = document.createElement('div');
        const catImage = document.createElement('img');
        catItem.setAttribute('data-catId', cat.id);
        catItem.className =
            'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-fit md:w-70 border border-gray-300 hover:scale-105 transition-all';
        // 고양이 클릭 이벤트
        catItem.onclick = () => {
            currentCatId = cat.id;
            tagList.innerHTML = '';
            tags.splice(0, tags.length);
            getInitialTags(currentCatId);
            openModal(cat.url, cat.id, tags);
        };
        catImage.src = cat.url;
        catImage.alt = '고양이 사진';
        catImage.className = 'w-full rounded-t-md h-20 md:h-60 object-cover';
        catItem.appendChild(catImage);
        const tagContainer = document.createElement('div');
        tagContainer.className = 'tagContainer mt-2 flex flex-wrap';
        // 기존 태그 가져오기
        const existingTags = getTag(cat.id);
        existingTags.forEach((tag) => {
            const tagElement = createTagElement(tag);
            tagContainer.appendChild(tagElement);
        });
        tags.push(...existingTags);
        // 랜덤 태그 생성
        if (existingTags.length === 0) {
            const initialRandomTags = randomTags(3);
            initialRandomTags.forEach((tag) => {
                const tagElement = createTagElement(tag);
                tagContainer.appendChild(tagElement);
            });
            tags.push(...initialRandomTags);
            postTag(cat.id, [...new Set(tags)]);
        }
        catItem.appendChild(tagContainer);
        catList === null || catList === void 0 ? void 0 : catList.appendChild(catItem);
    });
    updatePagination(page, createCatCard);
});
// 태그 검색 기능
let timeoutId;
const searchCatsByTag = (tag) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        loading.classList.remove('hidden');
        const response = yield fetch(`${API_URL}?limit=9&page=0`);
        const cats = yield response.json();
        catList.innerHTML = '';
        cats.slice(0, 9).forEach((cat) => {
            const catItem = createCatItem(cat);
            catList.appendChild(catItem);
        });
    }
    catch (error) {
        console.log('고양이 목록 검색 실패', error);
        alert('고양이 목록을 가져오는 데 실패했습니다. 다시 시도해 주세요.');
    }
    finally {
        loading.classList.add('hidden');
    }
});
// 고양이 카드 생성 함수
const createCatItem = (cat) => {
    const catItem = document.createElement('div');
    const catImage = document.createElement('img');
    catItem.setAttribute('data-catId', cat.id);
    catItem.className =
        'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-fit md:w-70 border border-gray-300 hover:scale-105 transition-all';
    // 고양이 클릭 이벤트
    catItem.onclick = () => {
        currentCatId = cat.id;
        tagList.innerHTML = '';
        tags.splice(0, tags.length);
        getInitialTags(currentCatId);
        openModal(cat.url, cat.id, tags);
    };
    catImage.src = cat.url;
    catImage.alt = '고양이 사진';
    catImage.className = 'w-full rounded-t-md h-20 md:h-60 object-cover';
    catItem.appendChild(catImage);
    const tagContainer = document.createElement('div');
    tagContainer.className = 'tagContainer mt-2 flex flex-wrap gap-2';
    const existingTags = getTag(cat.id);
    existingTags.forEach((tag) => {
        const tagElement = createTagElement(tag);
        tagContainer.appendChild(tagElement);
    });
    catItem.appendChild(tagContainer);
    return catItem;
};
// 태그 검색 이벤트 리스너
tagSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(timeoutId);
    if (query) {
        timeoutId = setTimeout(() => {
            searchCatsByTag(query);
        }, 300);
    }
    else {
        catList.innerHTML = '';
        createCatCard(currentPage);
    }
});
// 초기 고양이 카드 생성
createCatCard(currentPage);
handleLike();
