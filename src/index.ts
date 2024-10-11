const catList = document.getElementById('catList') as HTMLElement
const pagination = document.getElementById('pagination') as HTMLElement

const currentPage = 1
const itemsPerPage = 9

// GET
const getCats = async (page: number) => {
  try {
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=${itemsPerPage}&page=${page}`,
    )

    const cats = await response.json()
    return cats
  } catch (error) {
    console.log('고양이 목록 가져오기 실패', error)
  }
}

// 고양이 카드 띄우기
const createCatCard = async (page: number) => {
  const cats = await getCats(page)
  catList.innerHTML = '' // 이전 카드 지우기

  cats.slice(0, 9).forEach((cat: { url: string }) => {
    const catItem = document.createElement('div')
    const catImage = document.createElement('img')

    catItem.className =
      'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-30 md:w-60 md:h-60 border border-gray-300 hover:scale-105 transition-all'
    catImage.src = cat.url
    catImage.alt = '고양이 사진'
    catImage.className = 'w-full rounded-t-md h-20 md:h-40 object-cover'
    catItem.appendChild(catImage)
    catList?.appendChild(catItem)
  })
  updatePagination(page)
}

// 페이지네이션
const updatePagination = (currentPage: number) => {
  const totalPage = 5
  pagination.innerHTML = ''

  for (let i = 1; i <= totalPage; i++) {
    const button = document.createElement('button')
    button.innerText = `${i}`
    button.className = `mx-1 px-4 py-2 border border-gray-300 ${
      i === currentPage
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'text-gray-300 hover:bg-blue-500 transition-all hover:text-white'
    } rounded`
    button.disabled = i === currentPage // 현재 페이지 버튼 비활성화

    button.addEventListener('click', () => {
      if (button.disabled) return
      currentPage = i
      createCatCard(currentPage)
    })
    pagination.appendChild(button)
  }
}

createCatCard(currentPage)
