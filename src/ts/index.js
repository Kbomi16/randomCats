var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCats } from './api.js';
import { handleLike } from './handleLike.js';
import { openModal } from './modal.js';
import { updatePagination } from './pagination.js';
import { randomTags } from '../utils/randomTags.js';
const API_URL = 'https://api.thecatapi.com/v1/images/search';
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
        'relative border border-gray-300 text-gray-500 rounded-full px-2 py-1 text-xs';
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
        const catItem = createCatItem(cat); // 고양이 카드 생성
        catList.appendChild(catItem); // 카드 추가
    });
    updatePagination(page, createCatCard); // 페이지네이션 업데이트
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
    tagContainer.className = 'tagContainer my-2 flex flex-wrap gap-2';
    const existingTags = getTag(cat.id);
    existingTags.forEach((tag) => {
        const tagElement = createTagElement(tag);
        tagContainer.appendChild(tagElement);
    });
    if (existingTags.length === 0) {
        const randomTag = randomTags(3); // 3개의 무작위 태그 생성
        randomTag.forEach((tag) => {
            const tagElement = createTagElement(tag);
            tagContainer.appendChild(tagElement); // 카드에 무작위 태그 추가
        });
        postTag(cat.id, randomTag); // 로컬 스토리지에 저장
    }
    catItem.appendChild(tagContainer); // 태그 컨테이너 추가
    return catItem;
};
// 태그 검색 이벤트 리스너
// 태그 검색 기능
const searchCatsByTag = (tag) => __awaiter(void 0, void 0, void 0, function* () {
    // 로컬 스토리지에서 모든 고양이 ID 가져오기
    const allCats = Object.keys(localStorage);
    // 해당 태그가 포함된 고양이 ID 찾기
    const filteredCats = allCats.filter((id) => getTag(id).includes(tag));
    // 고양이 목록 초기화
    catList.innerHTML = '';
    // 각 고양이 ID에 대해 API 호출
    for (const id of filteredCats) {
        const response = yield fetch(`${API_URL}?limit=1&page=0`); // API 호출
        const catData = yield response.json();
        const catItem = createCatItem(catData[0]); // 고양이 카드 생성
        catList.appendChild(catItem); // 고양이 카드 추가
    }
});
// 태그 검색 이벤트 리스너
tagSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        searchCatsByTag(query); // 검색 함수 호출
    }
    else {
        catList.innerHTML = ''; // 입력이 없을 때 리스트 초기화
        createCatCard(currentPage); // 초기 고양이 카드 표시
    }
});
// 초기 고양이 카드 생성
createCatCard(currentPage);
handleLike();
