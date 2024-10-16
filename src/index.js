var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// 태그 추가 + 삭제
addTagButton.addEventListener('click', () => {
    if (!currentCatId)
        return;
    const tagValue = tagInput.value.trim();
    if (tagValue) {
        addTag(tagValue);
    }
    updateCatTag(currentCatId);
});
const addTag = (tagValue) => {
    if (!currentCatId)
        return;
    tags.push(tagValue);
    const tagElement = document.createElement('span');
    tagElement.textContent = `#${tagValue}`;
    tagElement.className =
        'border border-gray-300 text-gray-500 rounded-full px-2 py-1 relative inline-block mr-4 mb-2 text-xs';
    // 태그 삭제
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.className =
        'absolute -top-2 -right-3 text-white rounded-full bg-blue-500 w-6 h-6 flex items-center justify-center p-1';
    deleteButton.addEventListener('click', () => {
        if (!currentCatId)
            return;
        tags.splice(tags.indexOf(tagValue), 1);
        tagList.removeChild(tagElement);
        postTag(currentCatId, tags);
        // 메인 고양이 리스트에서 해당 카드의 태그를 업데이트
        updateCatTag(currentCatId);
    });
    tagElement.appendChild(deleteButton);
    tagList.appendChild(tagElement);
    tagInput.value = '';
    postTag(currentCatId, [...new Set(tags)]);
};
// 카드에 바로 태그 업데이트 하기
const updateCatTag = (catId) => {
    const catItemTagContainer = document.querySelector(`[data-catId="${catId}"] .tagContainer`);
    // 해당 카드의 태그 컨테이너를 초기화
    if (catItemTagContainer)
        catItemTagContainer.innerHTML = '';
    // 업데이트된 태그를 다시 렌더링
    const updatedTags = getTag(catId);
    updatedTags.forEach((tag) => {
        const updatedTagElement = document.createElement('span');
        updatedTagElement.textContent = `#${tag}`;
        updatedTagElement.className =
            'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs';
        if (catItemTagContainer)
            catItemTagContainer.appendChild(updatedTagElement);
    });
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
        const existingTags = getTag(cat.id);
        // 기존 태그가 있는지 확인
        existingTags.forEach((tag) => {
            const tagElement = document.createElement('span');
            tagElement.textContent = `#${tag}`;
            tagElement.className =
                'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs';
            tagContainer.appendChild(tagElement);
            tags.push(...existingTags);
        });
        // 기존 태그가 없으면 랜덤 태그 생성
        if (existingTags.length === 0) {
            const initialRandomTags = randomTags(3);
            initialRandomTags.forEach((tag) => {
                const tagElement = document.createElement('span');
                tagElement.textContent = `#${tag}`;
                tagElement.className =
                    'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs';
                tagContainer.appendChild(tagElement);
            });
            tags.push(...initialRandomTags);
            postTag(cat.id, [...new Set(tags)]);
        }
        if (catItem) {
            catItem.appendChild(tagContainer);
        }
        catList === null || catList === void 0 ? void 0 : catList.appendChild(catItem);
    });
    updatePagination(page, createCatCard);
});
// 태그 검색 기능
let timeoutId;
const searchCatsByTag = (tag) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        loading.classList.remove('hidden');
        const response = yield fetch(`https://api.thecatapi.com/v1/images/search?limit=9&page=0`);
        const cats = yield response.json();
        catList.innerHTML = '';
        // 9개만 보여주기 위해 slice 사용
        cats.slice(0, 9).forEach((cat) => {
            const catItem = document.createElement('div');
            const catImage = document.createElement('img');
            catItem.setAttribute('data-catId', cat.id);
            catItem.className =
                'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-fit md:w-70 border border-gray-300 hover:scale-105 transition-all';
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
            const existingTags = getTag(cat.id);
            existingTags.forEach((tag) => {
                const tagElement = document.createElement('span');
                tagElement.textContent = `#${tag}`;
                tagElement.className =
                    'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs';
                tagContainer.appendChild(tagElement);
                tags.push(...existingTags);
            });
            if (catItem) {
                catItem.appendChild(tagContainer);
            }
            catList === null || catList === void 0 ? void 0 : catList.appendChild(catItem);
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
createCatCard(currentPage);
handleLike();
