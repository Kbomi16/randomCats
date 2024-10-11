"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const catList = document.getElementById('catList');
// GET
const getCats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch('https://api.thecatapi.com/v1/images/search?limit=9');
        const cats = yield response.json();
        return cats;
    }
    catch (error) {
        console.log('고양이 목록 가져오기 실패', error);
    }
});
// 고양이 카드 띄우기
const createCatCard = () => __awaiter(void 0, void 0, void 0, function* () {
    const cats = yield getCats();
    cats.slice(0, 9).forEach((cat) => {
        const catItem = document.createElement('div');
        const catImage = document.createElement('img');
        catItem.className =
            'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-30 md:w-60 md:h-60 border border-black hover:scale-105 transition-all';
        catImage.src = cat.url;
        catImage.alt = '고양이 사진';
        catImage.className = 'w-full rounded-t-md h-20 md:h-40 object-cover';
        catItem.appendChild(catImage);
        catList === null || catList === void 0 ? void 0 : catList.appendChild(catItem);
    });
});
createCatCard();
