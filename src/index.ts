import { randomTags } from './randomTags.js'

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

// 로컬스토리지에서 특정 id에 대한 태그 가져오기
const getTag = (id: string) => {
  const storedTags = localStorage.getItem(id)
  return storedTags ? JSON.parse(storedTags) : []
}

// 로컬스토리지에 특정 id에 대한 태그 저장하기
const postTag = (id: string, tag: string[]) => {
  localStorage.setItem(id, JSON.stringify(tags))
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
  const tagValue = tagInput.value.trim()
  if (tagValue) {
    addTag(tagValue)
  }
})

const addTag = (tagValue: string) => {
  if (!currentCatId) return
  tags.push(tagValue)

  const tagElement = document.createElement('span')
  tagElement.textContent = `#${tagValue}`
  tagElement.className =
    'border border-gray-300 text-gray-500 rounded-full px-2 py-1 relative inline-block mr-4 mb-2'

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
  })

  tagElement.appendChild(deleteButton)
  tagList.appendChild(tagElement)
  tagInput.value = ''
  postTag(currentCatId, tags)
}

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
  catList.innerHTML = ''

  cats.slice(0, 9).forEach((cat: { id: string; url: string }) => {
    const catItem = document.createElement('div')
    const catImage = document.createElement('img')

    catItem.className =
      'cursor-pointer rounded-md flex flex-col p-1 items-center w-30 h-30 md:w-60 md:h-60 border border-gray-300 hover:scale-105 transition-all'
    catItem.onclick = () => {
      currentCatId = cat.id
      tagList.innerHTML = ''
      tags.splice(0, tags.length)
      getInitialTags(currentCatId)
      openModal(cat.url)
    }

    catImage.src = cat.url
    catImage.alt = '고양이 사진'
    catImage.className = 'w-full rounded-t-md h-20 md:h-40 object-cover'
    catItem.appendChild(catImage)

    const tagContainer = document.createElement('div')
    tagContainer.className = 'mt-2 flex flex-wrap'

    const existingTags = getTag(cat.id)
    // 기존 태그가 있는지 확인
    if (existingTags.length > 0) {
      existingTags.forEach((tag: string) => {
        const tagElement = document.createElement('span')
        tagElement.textContent = `#${tag}`
        tagElement.className =
          'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2'
        tagContainer.appendChild(tagElement)
      })
    } else {
      // 기존 태그가 없으면 랜덤 태그 생성
      const initialRandomTags = randomTags(3)
      initialRandomTags.forEach((tag) => {
        const tagElement = document.createElement('span')
        tagElement.textContent = `#${tag}`
        tagElement.className =
          'border border-gray-300 text-gray-500 rounded-full px-2 py-1 mr-2 mb-2'
        tagContainer.appendChild(tagElement)
      })
      tags.push(...initialRandomTags)
      postTag(cat.id, tags)
    }

    catItem.appendChild(tagContainer)
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
const openModal = (imageUrl: string) => {
  modalImage.src = imageUrl
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

createCatCard(currentPage)
