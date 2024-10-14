var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { randomTags } from './utils/randomTags.js';
const catList = document.getElementById('catList');
const pagination = document.getElementById('pagination');
const currentPage = 1;
const itemsPerPage = 9;
const modal = document.getElementById('modal');
const closeModalIcon = document.getElementById('closeModalIcon');
const modalImage = document.getElementById('modalImage');
const tagInput = document.getElementById('tagInput');
const addTagButton = document.getElementById('addTagButton');
const tagList = document.getElementById('tagList');
const tags = [];
let currentCatId = null;
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
// GET
const getCats = (page) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`https://api.thecatapi.com/v1/images/search?limit=${itemsPerPage}&page=${page}`);
        const cats = yield response.json();
        return cats;
    }
    catch (error) {
        console.log('고양이 목록 가져오기 실패', error);
    }
});
// 고양이 카드 띄우기
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
            openModal(cat.url);
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
    updatePagination(page);
});
// 페이지네이션
const updatePagination = (currentPage) => {
    const totalPage = 5;
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPage; i++) {
        const button = document.createElement('button');
        button.innerText = `${i}`;
        button.className = `mx-1 px-4 py-2 border border-gray-300 ${i === currentPage
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'text-gray-300 hover:bg-blue-500 transition-all hover:text-white'} rounded`;
        button.disabled = i === currentPage; // 현재 페이지 버튼 비활성화
        button.addEventListener('click', () => {
            if (button.disabled)
                return;
            currentPage = i;
            createCatCard(currentPage);
        });
        pagination.appendChild(button);
    }
};
// 모달
const openModal = (imageUrl) => {
    modalImage.src = imageUrl;
    modal.classList.remove('hidden');
};
const closeModal = () => {
    modal.classList.add('hidden');
};
closeModalIcon.onclick = closeModal;
// modal: 모달배경이기 때문에 배경을 클릭한 경우 모달 닫기
modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal();
    }
};
createCatCard(currentPage);
