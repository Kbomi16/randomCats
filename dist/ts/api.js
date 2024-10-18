var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = 'https://api.thecatapi.com/v1/images/search';
const loading = document.getElementById('loading');
const itemsPerPage = 9;
export const getCats = (page) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        loading.classList.remove('hidden');
        const response = yield fetch(`${API_URL}?limit=${itemsPerPage}&page=${page}`);
        const cats = yield response.json();
        return cats;
    }
    catch (error) {
        console.log('고양이 목록 가져오기 실패', error);
    }
    finally {
        loading.classList.add('hidden');
    }
});
