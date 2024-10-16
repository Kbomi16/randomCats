import { randomTags } from './utils/randomTags.js'

const catList = document.getElementById('catList') as HTMLElement

const pagination = document.getElementById('pagination') as HTMLElement
const currentPage = 1
const itemsPerPage = 9

const modal = document.getElementById('modal') as HTMLElement
const closeModalIcon = document.getElementById('closeModalIcon') as HTMLElement
const modalImage = document.getElementById('modalImage') as HTMLImageElement

const tagInput = document.getElementById('tagInput') as HTMLInputElement
const addTagButton = document.getElementById(
  'addTagButton',
) as HTMLButtonElement
const tagList = document.getElementById('tagList') as HTMLElement
const tags: string[] = []

let currentCatId: string | null = null

const likeButton = document.getElementById('likeButton') as HTMLButtonElement
const likeCountDisplay = document.getElementById('likeCount') as HTMLElement
const filledHeart = likeButton.querySelector(
  'img[alt="채워진 하트"]',
) as HTMLImageElement
const emptyHeart = likeButton.querySelector(
  'img[alt="빈 하트"]',
) as HTMLImageElement

let likeCount = 0
let isLiked = false

const tagSearchInput = document.getElementById('tagSearch') as HTMLElement
const loading = document.getElementById('loading') as HTMLElement
const tagResults = document.getElementById('tagResults') as HTMLElement

// 좋아요 누르기
likeButton.addEventListener('click', () => {
  isLiked = !isLiked

  if (isLiked) {
    likeCount += 1
    filledHeart.classList.remove('hidden')
    emptyHeart.classList.add('hidden')
  } else {
    likeCount -= 1
    filledHeart.classList.add('hidden')
    emptyHeart.classList.remove('hidden')
  }
  likeCountDisplay.textContent = likeCount.toString()
})

// 로컬스토리지에서 특정 id에 대한 태그 가져오기
const getTag = (id: string) => {
  const storedTags = localStorage.getItem(id)
  return storedTags ? JSON.parse(storedTags) : []
}

// 로컬스토리지에 특정 id에 대한 태그 저장하기
const postTag = (id: string, tag: string[]) => {
  localStorage.setItem(id, JSON.stringify([...new Set(tag)]))
}

// 초기 태그값
const getInitialTags = (id: string) => {
  const initialTags = getTag(id)
  initialTags.forEach((tag: string) => {
    addTag(tag)
  })
}

// 태그 추가 + 삭제
addTagButton.addEventListener('click', () => {
  if (!currentCatId) return

  const tagValue = tagInput.value.trim()
  if (tagValue) {
    addTag(tagValue)
  }
  updateCatTag(currentCatId)
})

const addTag = (tagValue: string) => {
  if (!currentCatId) return

  tags.push(tagValue)

  const tagElement = document.createElement('span') as HTMLSpanElement
  tagElement.textContent = `#${tagValue}`
  tagElement.className =
    'border border-gray-300 text-gray-500 rounded-full px-2 py-1 relative inline-block mr-4 mb-2 text-xs'

  // 태그 삭제
  const deleteButton = document.createElement('button')
  deleteButton.textContent = 'x'
  deleteButton.className =
    'absolute -top-2 -right-3 text-white rounded-full bg-blue-500 w-6 h-6 flex items-center justify-center p-1'

  deleteButton.addEventListener('click', () => {
    if (!currentCatId) return
    tags.splice(tags.indexOf(tagValue), 1)
    tagList.removeChild(tagElement)
    postTag(currentCatId, tags)

    // 메인 고양이 리스트에서 해당 카드의 태그를 업데이트
    updateCatTag(currentCatId)
  })

  tagElement.appendChild(deleteButton)
  tagList.appendChild(tagElement)
  tagInput.value = ''
  postTag(currentCatId, [...new Set(tags)])
}

// 카드에 바로 태그 업데이트 하기
const updateCatTag = (catId: string) => {
  const catItemTagContainer = document.querySelector(
    `[data-catId="${catId}"] .tagContainer`,
  ) as HTMLElement

  // 해당 카드의 태그 컨테이너를 초기화
  if (catItemTagContainer) catItemTagContainer.innerHTML = ''

  // 업데이트된 태그를 다시 렌더링
  const updatedTags = getTag(catId)
  updatedTags.forEach((tag: string) => {
    const updatedTagElement = document.createElement('span') as HTMLSpanElement
    updatedTagElement.textContent = `#${tag}`
    updatedTagElement.className =
      'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs'
    if (catItemTagContainer) catItemTagContainer.appendChild(updatedTagElement)
  })
}

// GET
const getCats = async (page: number) => {
  try {
    loading.classList.remove('hidden')
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=${itemsPerPage}&page=${page}`,
    )

    const cats = await response.json()
    return cats
  } catch (error) {
    console.log('고양이 목록 가져오기 실패', error)
  } finally {
    loading.classList.add('hidden')
  }
}

// 고양이 카드 생성
const createCatCard = async (page: number) => {
  const cats = await getCats(page)
  catList.innerHTML = ''

  cats.slice(0, 9).forEach((cat: { id: string; url: string }) => {
    const catItem = document.createElement('div') as HTMLDivElement
    const catImage = document.createElement('img') as HTMLImageElement

    catItem.setAttribute('data-catId', cat.id)
    catItem.className =
      'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-fit md:w-70 border border-gray-300 hover:scale-105 transition-all'
    catItem.onclick = () => {
      currentCatId = cat.id
      tagList.innerHTML = ''
      tags.splice(0, tags.length)
      getInitialTags(currentCatId)
      openModal(cat.url, cat.id, tags)
    }

    catImage.src = cat.url
    catImage.alt = '고양이 사진'
    catImage.className = 'w-full rounded-t-md h-20 md:h-60 object-cover'
    catItem.appendChild(catImage)

    const tagContainer = document.createElement('div') as HTMLDivElement
    tagContainer.className = 'tagContainer mt-2 flex flex-wrap'

    const existingTags = getTag(cat.id)
    // 기존 태그가 있는지 확인
    existingTags.forEach((tag: string) => {
      const tagElement = document.createElement('span') as HTMLSpanElement
      tagElement.textContent = `#${tag}`
      tagElement.className =
        'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs'
      tagContainer.appendChild(tagElement)
      tags.push(...existingTags)
    })
    // 기존 태그가 없으면 랜덤 태그 생성
    if (existingTags.length === 0) {
      const initialRandomTags = randomTags(3)
      initialRandomTags.forEach((tag) => {
        const tagElement = document.createElement('span') as HTMLSpanElement
        tagElement.textContent = `#${tag}`
        tagElement.className =
          'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2 text-xs'
        tagContainer.appendChild(tagElement)
      })
      tags.push(...initialRandomTags)
      postTag(cat.id, [...new Set(tags)])
    }

    if (catItem) {
      catItem.appendChild(tagContainer)
    }
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

// 모달
const openModal = (imageUrl: string, catId: string, tags: string[]) => {
  modalImage.src = imageUrl
  const modalTitle = document.querySelector('#modal h2') as HTMLElement
  modalTitle.textContent = `😺 ${catId} | ${tags[0]} 고양이`

  modal.classList.remove('hidden')
}

const closeModal = () => {
  modal.classList.add('hidden')
}

closeModalIcon.onclick = closeModal
// modal: 모달배경이기 때문에 배경을 클릭한 경우 모달 닫기
modal.onclick = (e) => {
  if (e.target === modal) {
    closeModal()
  }
}

// 태그 검색 기능
let timeoutId: number

const searchCatsByTag = async (tag: string) => {
  try {
    loading.classList.remove('hidden')
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=9&page=0`,
    )

    const cats = await response.json()
    catList.innerHTML = ''

    cats.forEach((cat: { url: string }) => {
      const catItem = document.createElement('div')
      catItem.className = 'cat-item'
      catItem.innerHTML = `
                <img src="${cat.url}" alt="고양이 사진" />
                <span>#${tag}</span>
            `
      catList.appendChild(catItem)
    })
  } catch (error) {
    console.log('고양이 목록 검색 실패', error)
    alert('고양이 목록을 가져오는 데 실패했습니다. 다시 시도해 주세요.')
  } finally {
    loading.classList.add('hidden')
  }
}

// 태그 검색 이벤트 리스너
tagSearchInput.addEventListener('input', (e) => {
  const query = (e.target as HTMLInputElement).value.trim()
  clearTimeout(timeoutId)

  if (query) {
    timeoutId = setTimeout(() => {
      searchCatsByTag(query)
    }, 300)
  } else {
    catList.innerHTML = ''
    createCatCard(currentPage)
  }
})

createCatCard(currentPage)
