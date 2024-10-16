const pagination = document.getElementById('pagination');
export const updatePagination = (currentPage, createCatCard) => {
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
