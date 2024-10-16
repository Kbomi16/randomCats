import { API_URL } from './constants/API_URL.js'
import { getCats } from './ts/api.js'
import { handleLike } from './ts/handleLike.js'
import { openModal } from './ts/modal.js'
import { updatePagination } from './ts/pagination.js'
import { randomTags } from './utils/randomTags.js'

const catList = document.getElementById('catList') as HTMLElement
const currentPage = 1

const tagInput = document.getElementById('tagInput') as HTMLInputElement
const addTagButton = document.getElementById(
  'addTagButton',
) as HTMLButtonElement
const tagList = document.getElementById('tagList') as HTMLElement
const tags: string[] = []
let currentCatId: string | null = null

const tagSearchInput = document.getElementById('tagSearch') as HTMLElement
const loading = document.getElementById('loading') as HTMLElement

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

// 고양이 카드에 태그를 업데이트하는 함수
const updateCatTag = (catId: string) => {
  const catItemTagContainer = document.querySelector(
    `[data-catId="${catId}"] .tagContainer`,
  ) as HTMLElement
  if (catItemTagContainer) {
    catItemTagContainer.innerHTML = ''
    const updatedTags = getTag(catId)
    updatedTags.forEach((tag: string) => {
      const tagElement = createTagElement(tag)
      catItemTagContainer.appendChild(tagElement)
    })
  }
}

// 태그 요소 생성
const createTagElement = (tagValue: string) => {
  const tagElement = document.createElement('span') as HTMLSpanElement
  tagElement.textContent = `#${tagValue}`
  tagElement.className =
    'relative border border-gray-300 text-gray-500 rounded-full px-2 mr-1 py-1 mb-2 text-xs'
  return tagElement
}

addTagButton.addEventListener('click', () => {
  if (!currentCatId) return

  const tagValue = tagInput.value.trim()
  if (tagValue) {
    addTag(tagValue)
  }
  updateCatTag(currentCatId)
})

// 태그 추가 및 삭제 기능 구현
const addTag = (tagValue: string) => {
  if (!currentCatId) return
  tags.push(tagValue)

  const tagElement = createTagElement(tagValue)

  // 태그 삭제 버튼 생성
  const deleteButton = document.createElement('button')
  deleteButton.textContent = 'x'
  deleteButton.className =
    'absolute -top-2 -right-3 text-white rounded-full bg-blue-500 w-6 h-6 flex items-center justify-center p-1'

  // 삭제 버튼 클릭 이벤트 리스너
  deleteButton.addEventListener('click', () => {
    if (!currentCatId) return

    tags.splice(tags.indexOf(tagValue), 1)
    tagList.removeChild(tagElement)
    postTag(currentCatId, tags)
    updateCatTag(currentCatId)
  })

  tagElement.appendChild(deleteButton)
  tagList.appendChild(tagElement)
  tagInput.value = ''
  postTag(currentCatId, [...new Set(tags)])
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

    // 고양이 클릭 이벤트
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

    // 기존 태그 가져오기
    const existingTags = getTag(cat.id)
    existingTags.forEach((tag: string) => {
      const tagElement = createTagElement(tag)
      tagContainer.appendChild(tagElement)
    })
    tags.push(...existingTags)

    // 랜덤 태그 생성
    if (existingTags.length === 0) {
      const initialRandomTags = randomTags(3)
      initialRandomTags.forEach((tag) => {
        const tagElement = createTagElement(tag)
        tagContainer.appendChild(tagElement)
      })
      tags.push(...initialRandomTags)
      postTag(cat.id, [...new Set(tags)])
    }

    catItem.appendChild(tagContainer)
    catList?.appendChild(catItem)
  })
  updatePagination(page, createCatCard)
}

// 태그 검색 기능
let timeoutId: number

const searchCatsByTag = async (tag: string) => {
  try {
    loading.classList.remove('hidden')
    const response = await fetch(`${API_URL}?limit=9&page=0`)
    const cats = await response.json()
    catList.innerHTML = ''

    cats.slice(0, 9).forEach((cat: { id: string; url: string }) => {
      const catItem = createCatItem(cat)
      catList.appendChild(catItem)
    })
  } catch (error) {
    console.log('고양이 목록 검색 실패', error)
    alert('고양이 목록을 가져오는 데 실패했습니다. 다시 시도해 주세요.')
  } finally {
    loading.classList.add('hidden')
  }
}

// 고양이 카드 생성 함수
const createCatItem = (cat: { id: string; url: string }) => {
  const catItem = document.createElement('div') as HTMLDivElement
  const catImage = document.createElement('img') as HTMLImageElement

  catItem.setAttribute('data-catId', cat.id)
  catItem.className =
    'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-fit md:w-70 border border-gray-300 hover:scale-105 transition-all'

  // 고양이 클릭 이벤트
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
  tagContainer.className = 'tagContainer mt-2 flex flex-wrap gap-2'

  const existingTags = getTag(cat.id)
  existingTags.forEach((tag: string) => {
    const tagElement = createTagElement(tag)
    tagContainer.appendChild(tagElement)
  })

  catItem.appendChild(tagContainer)
  return catItem
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

// 초기 고양이 카드 생성
createCatCard(currentPage)
handleLike()
