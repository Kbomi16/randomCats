import { getCats } from './api.js'
import { handleLike } from './handleLike.js'
import { openModal } from './modal.js'
import { updatePagination } from './pagination.js'
import { randomTags } from '../utils/randomTags.js'
import { debounce } from '../utils/debounce.js'

const API_URL = 'https://api.thecatapi.com/v1/images/search'

const catList = document.getElementById('catList') as HTMLElement
const currentPage = 1

const pagination = document.getElementById('pagination') as HTMLElement

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
    'relative border border-gray-300 text-gray-500 rounded-full px-2 py-1 text-xs'
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
    const catItem = createCatItem(cat) // 고양이 카드 생성
    catList.appendChild(catItem) // 카드 추가
  })

  updatePagination(page, createCatCard) // 페이지네이션 업데이트
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
  tagContainer.className = 'tagContainer my-2 flex flex-wrap gap-2'

  const existingTags = getTag(cat.id)
  existingTags.forEach((tag: string) => {
    const tagElement = createTagElement(tag)
    tagContainer.appendChild(tagElement)
  })

  if (existingTags.length === 0) {
    const randomTag = randomTags(3)
    randomTag.forEach((tag) => {
      const tagElement = createTagElement(tag)
      tagContainer.appendChild(tagElement)
    })
    postTag(cat.id, randomTag)
  }

  catItem.appendChild(tagContainer)
  return catItem
}

const searchCatsByTag = async (tag: string) => {
  // 로컬 스토리지에서 모든 고양이 ID 가져오기
  const allCats = Object.keys(localStorage)

  // 해당 태그가 포함된 고양이 ID 찾기
  const filteredCats = allCats.filter((id) => getTag(id).includes(tag))

  catList.innerHTML = ''

  if (filteredCats.length === 0) {
    const noCatsMessage = document.createElement('div')
    noCatsMessage.textContent = '해당 태그를 가진 고양이가 없습니다.'
    catList.appendChild(noCatsMessage)
    return
  }

  // 각 고양이 ID에 대해 카드 생성
  for (const id of filteredCats) {
    const catData = await fetch(`https://api.thecatapi.com/v1/images/${id}`)
    const cat = await catData.json()
    const catItem = createCatItem(cat)
    catList.appendChild(catItem)
  }
}

tagSearchInput.addEventListener(
  'input',
  debounce((e) => {
    const query = (e.target as HTMLInputElement).value.trim()

    if (query) {
      pagination.classList.add('hidden')
      searchCatsByTag(query)
    } else {
      pagination.classList.remove('hidden')
      catList.innerHTML = ''
      createCatCard(currentPage)
    }
  }, 300),
)

createCatCard(currentPage)
handleLike()
